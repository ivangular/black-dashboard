import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {HttpClient} from '@angular/common/http';
import {Subscription} from 'rxjs';
import {MessageService} from '../../_services';
// json import
// https://medium.com/@baerree/angular-7-import-json-14f8bba534af
// not sure why I need to ignore the linter here, because the import seems to be working ok
// @ts-ignore
import communication from './communication.json';

enum columns  {chrom, pos, gt, freqs, annotation, gt_mom, gt_dad, flags, length}
@Component({
        selector: 'app-dashboard',
        templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit {
        constructor(
                private route: ActivatedRoute,
                private http: HttpClient,
                private messageService: MessageService
        ) {
                // subscribe to home component messages
                this.subscription = this.messageService.getMessage().subscribe(message => {
                        if (message) {
                                const field = message.text.split(' ');
                                if (field[0] === 'filter') {
                                        this.updateFilter(field[1], field[2] === 'true');
                                        this.showVariantTable(); // this will show the re-filtered data
                                        this.clearVariantInfo();
                                 }
                        }
                });
        }
        subscription: Subscription;
        private caseno: number;
        public variant: any;
        public contents: string;
        public contentsEn = '';
        public contentsHr = '';
        public clickedEn = true;
        public clickedHr = false;
        private variantDataIds: any;
        private variantProvenance: any;
        private uniprot: any = null;
        private omim: any = null;
        private kegg: any = null;
        private keggPathwayIds: any = null;
        private keggPathwayName: any = null;
        private biogridHTMLtable: any = null;
        private trrustHTMLtable: any = null;
        private keggHTMLtable: any = null;
        private annotExpansion =  {e: 'exonic', intr: 'intronic', s: 'splice',
                d: 'downstream', u: 'upstream', r: 'RNA', f: '(ann. missing)'};
        private filterPositive: number;
        private filterNegative: number;
        private HOMOZYGOTE   =  1;
        private COMMON       =  2;
        private EXONIC       =  4;
        private SILENT       =  8;
        private DE_NOVO      = 16;
        private PARENT_HOMOZYGOTE = 32;
        // tslint:disable-next-line:no-bitwise
        private positiveFlags = this.EXONIC |  this.HOMOZYGOTE | this.DE_NOVO;
        // tslint:disable-next-line:no-bitwise
        private negativeFlags = this.COMMON | this.SILENT | this.PARENT_HOMOZYGOTE;
        // https://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&position=chr1:47219779-47219787

        ngOnInit() {
                console.log('sending message');
                this.messageService.sendMessage('flist reset');
                this.messageService.sendMessage('flist show');
                // variant filtering
                this.filterPositive = 0;
                this.filterNegative = 0;
                // case description here
                this.caseno = null;
                this.contentsEn = '';
                this.contentsHr = '';
                // variants details table
                this.variantProvenance = ['var-proband', 'var-mother', 'var-father']; // rows
                this.variantDataIds = ['vardat-0', 'vardat-1', 'vardat-2', 'vardat-3']; // columns
                this.variant = [];
                // note that the path to here is defined in multipanel-layout.routing.ts
                this.route.params.subscribe(params => {
                        const caseno = params.caseno;
                        this.caseno = caseno;
                        this.http
                                .get(`assets/case_descriptions/case${caseno}.en.txt`, {responseType: 'text'})
                                .subscribe(data => {
                                        this.contentsEn = data;
                                        this.contents = this.contentsEn;
                                        this.descriptionUpdate();
                                });
                        this.http
                                .get(`assets/case_descriptions/case${caseno}.hr.txt`, {responseType: 'text'})
                                .subscribe(data => {
                                        this.contentsHr = data;
                                });
                        this.http
                                .get(`assets/case_vcfs/case${caseno}.tsv`, {responseType: 'text'})
                                .subscribe(data => {
                                       this.loadVariantTable(data);
                                       this.attachListenerToVariantTable();
                                       this.showVariantTable();
                                });
                        this.http
                                .get(`assets/case_id_resolution_tables/case${caseno}.ids.tsv`, {responseType: 'text'})
                                .subscribe(data => {
                                        this.uniprot = {};
                                        this.omim = {};
                                        this.kegg = {};
                                        this.keggPathwayIds = {};
                                        this.keggPathwayName = {};
                                        for (const line of data.split('\n')) {
                                             const field = line.split('\t');
                                             this.uniprot[field[0]] = field[1];
                                             this.omim[field[0]] = field[2];
                                             if (field[3] !== 'x') {
                                                     this.kegg[field[0]] = field[3]; // do I really need this?
                                                     if (field[4] !== 'x') {
                                                             this.keggPathwayIds[field[0]] = field[4];
                                                     }
                                             }
                                        }
                                });
                        this.http
                                .get(`assets/kegg_pthwys.tsv`, {responseType: 'text'})
                                .subscribe(data => {
                                        this.keggPathwayName = {};
                                        for (const line of data.split('\n')) {
                                                const field = line.split('\t');
                                                this.keggPathwayName[field[0]] = field[1];
                                        }
                                });

                });
        }

        private loadVariantTable(data) {
                this.variant = [];
                for (const line of data.split('\n')) {
                        const fields = line.split('\t');
                        if (fields.length < columns.length) {continue; }
                        if (fields[0].charAt(0) === '#') {continue; }
                        this.variant.push(fields);
                }
        }
        private attachListenerToVariantTable() {
                 // count on event propagation to get to table, whichever row was clicked
                // (I do not want 1000 event listeners on the page)
                const table: HTMLTableElement = document.getElementById('variant-table') as HTMLTableElement;
                table.addEventListener('click',  this.onVariantClickHandler.bind(this), false);
        }
        private showVariantTable() {
                const table: HTMLTableElement = document.getElementById('variant-table') as HTMLTableElement;
                // this is supposed to be much faster than table.innerHTML = '';
                // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
                while (table.firstChild) { table.removeChild(table.firstChild); }
                console.log(' >>>> ', this.variant.length);
                let lengthFiltered = 0;
                for (let i = 0; i < this.variant.length; i++) {
                        // show only variants that g o through the filter
                        //  tslint:disable-next-line:no-bitwise
                        const positiveReq = (this.variant[i][columns.flags] & this.filterPositive) === this.filterPositive;
                        // tslint:disable-next-line:no-bitwise
                        const negativeReq = (~this.variant[i][columns.flags] & this.filterNegative) === this.filterNegative;
                        if (!positiveReq || !negativeReq) {continue; }

                        const row: HTMLTableRowElement = table.insertRow();
                        row.setAttribute('id', `var-${i}`);
                        row.setAttribute('class', 'tr-clickable');
                        const [location, strand, gene, protein1, protein2] = this.parseAnnotation(this.variant[i][columns.annotation]);
                        row.insertCell(0).innerHTML = this.variant[i][columns.chrom];
                        row.insertCell(1).innerHTML = gene;
                        row.insertCell(2).innerHTML = location;
                        let varDisplay: string =  this.variant[i][columns.gt];
                        if ( varDisplay.length > 15) {varDisplay = varDisplay.substring(0, 15) + ' ...'; }
                        row.insertCell(3).innerHTML = varDisplay;
                        lengthFiltered += 1;
                }
                document.getElementById('variant-count').innerText = `total: ${lengthFiltered}`;
        }
        private clearVariantInfo() {
                // variant detail
                document.getElementById('position').innerHTML = '';
                document.getElementById('position-gene').textContent = '';
                document.getElementById('position-protein').textContent = '';
                // variant detail - table
                document.getElementById('p-allele1').textContent = '';
                document.getElementById('p-allele2').textContent = '';
                document.getElementById('p-freq1').textContent = '';
                document.getElementById('p-freq2').textContent = '';
                document.getElementById('m-allele1').textContent = '';
                document.getElementById('m-allele2').textContent = '';
                document.getElementById('f-allele1').textContent = '';
                document.getElementById('f-allele2').textContent = '';
                // gene info
                document.getElementById('gene-summary').innerHTML = '';
                document.getElementById('gene-diseases').innerHTML = '';
                document.getElementById('gene-summary-title').innerText = '';
                document.getElementById('gene-diseases-title').innerText = '';
                // interaction table
                document.getElementById('gene-interaction-title').innerText = '';
                document.getElementById('gene-interaction-subtitle').innerText = '';
                // document.getElementById('interactant-table').innerHTML = '';
                const table: HTMLTableElement = document.getElementById('interactant-table') as HTMLTableElement;
                // this is supposed to be much faster than table.innerHTML = '';
                // https://stackoverflow.com/questions/3955229/remove-all-child-elements-of-a-dom-node-in-javascript
                while (table.firstChild) { table.removeChild(table.firstChild); }

         }


        private updateFilter(filter: number, on: boolean) {
                console.log(`updating filter ${filter} to ${on}`);
                // tslint:disable-next-line:no-bitwise
                if (filter & this.positiveFlags)  {
                        // tslint:disable-next-line:no-bitwise
                        this.filterPositive ^= filter;
                } else {
                        // tslint:disable-next-line:no-bitwise
                        this.filterNegative ^= filter;
                }
        }

        private onVariantClickHandler(e) {
                if (e.target !== e.currentTarget) {
                        const parentRow    =   e.target.closest('tr');
                        for ( const child of parentRow.parentElement.children) {
                                child.classList.remove('tr-clicked');
                        }
                        parentRow.classList.add('tr-clicked');
                        const clickedItem  =  parentRow.id;
                        const variantId = clickedItem.split('-')[1];
                        this.variantDetailUpdate(variantId);
                        const geneSymbol = this.variant[variantId][columns.annotation].split(':')[0];
                        let uniprotId = 'unk';
                        if (geneSymbol in this.uniprot) {
                                uniprotId = this.uniprot[geneSymbol];
                        }
                        this.geneInfoUpdate(geneSymbol, uniprotId);
                        this.interactionUpdate(geneSymbol, uniprotId);
                }
                e.stopPropagation();
        }

        private parseAnnotation(annotation) {
                let location = '';
                let strand =  '';
                let gene = '';
                let protein1 = ''; // allele1 effect on proteins
                let protein2 = ''; // allele2 effect on proteins
                if (annotation != null) {
                        const annotFields = annotation.split(':');
                        gene =  annotFields[0];
                        if (annotFields.length > 1 ) {strand = annotFields[1]; }
                        if (annotFields.length > 2 ) {
                                if (annotFields[2] in this.annotExpansion) {
                                        location = this.annotExpansion[annotFields[2]];
                                } else {
                                        location = annotFields[2];
                                }
                        }
                        if (annotFields.length > 3) {
                                [protein1, protein2] = annotFields[3].split('|');
                                if (protein2 == null) {protein2 = ''; }
                        }
                }
                return [location, strand, gene, protein1, protein2];
        }

        public descriptionUpdate() {
                document.getElementById('case-description').textContent = this.contents;
                // this.myChartData.data.datasets[0].data = this.data;
                // this.myChartData.update();
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////
        private ucscLink(chrom, pos) {
                let url = 'https://genome.ucsc.edu/cgi-bin/hgTracks?db=hg38&position=chr';
                // + insures this is interpreted as a number, and not as a string
                url += `${chrom}:${+pos - 4}-${+pos + 4}`;
                let link = `<a href="${url}" target="_blank">`;
                link += `GRCh38:chr${chrom}:${pos}</a>`;
                return link;
        }
        private fillVariantDetailPosition( variantId) {
                const chrom =  this.variant[variantId][columns.chrom];
                // + insures this is interpreted as a number, and not as a string
                const pos =  +this.variant[variantId][columns.pos];
                document.getElementById('position').innerHTML = this.ucscLink(chrom, pos);

                const  [location, strand, gene, protein1, protein2] = this.parseAnnotation(this.variant[variantId][columns.annotation]);
                document.getElementById('position-gene').textContent =  `${gene},  ${location}`;
                const p1ok = (protein1.length > 0) && (!protein1.includes('err'));
                const p2ok = (protein2.length > 0) && (!protein2.includes('err'));
                document.getElementById('position-protein').textContent = '';
                if ( protein1.length > 0 || protein2.length > 0) {
                        const [al1, al2] =    this.variant[variantId][columns.gt].split('|');
                        let aaString = '';
                        if (p1ok) { aaString += `${al1} => ${protein1}`; }
                        if (p1ok && p2ok) { aaString += ',  '; }
                        if (p2ok ) { aaString += `${al2} => ${protein2}`; }
                        document.getElementById('position-protein').textContent =  aaString;
                }
        }
        private fillVariantDetailTable( variantId) {
                const freqHumanReadable = {0: 'common', 1: '1:10', 2: '1:100', 3: '1:1K', 4: '1:10K',
                        5: '1:100K', 6: '1:1M', 7: '0', 8: '0', 9: '0'};
                // this.variant[variantId] is
                // chrom pos alleles freq annotation mom pop
                let alleles =  this.variant[variantId][2].split('|');
                document.getElementById('p-allele1').textContent = alleles[0];
                document.getElementById('p-allele2').textContent = alleles[1];
                const freqs  =  this.variant[variantId][3].split('|');
                document.getElementById('p-freq1').textContent = freqHumanReadable[freqs[0]];
                document.getElementById('p-freq2').textContent = freqHumanReadable[freqs[1]];

                alleles =  this.variant[variantId][5].split('|');
                document.getElementById('m-allele1').textContent = alleles[0];
                document.getElementById('m-allele2').textContent = alleles[1];

                alleles =  this.variant[variantId][6].split('|');
                document.getElementById('f-allele1').textContent = alleles[0];
                document.getElementById('f-allele2').textContent = alleles[1];
        }
        private variantDetailUpdate(variantId) {
                this.fillVariantDetailPosition(variantId);
                this.fillVariantDetailTable.bind(this)(variantId);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////
        private geneInfoUpdate(geneSymbol, uniprotId) {
                document.getElementById('gene-summary').innerHTML = '';
                document.getElementById('gene-diseases').innerHTML = '';
                document.getElementById('gene-summary-title').innerText = 'geneSymbol';
                document.getElementById('gene-diseases-title').innerText = 'geneSymbol';
                if (uniprotId === 'unk') {
                        document.getElementById('gene-summary').innerText = '(not available)';
                        document.getElementById('gene-diseases').innerText = '(not available)';
                        return;
                }
                // CORS compliance problem
                // note this: http://lindenb.github.io/pages/cors/index.html (bioinf services supporting CORS)
                // const url = `https://www.ncbi.nlm.nih.gov/gene/${geneId}`;
                const url = `https://www.uniprot.org/uniprot/${uniprotId}.xml`;
                // mode cors is actually the default - the problem is on the server side
                fetch(url, {mode: 'cors'})
                        .then(response => {
                                // When the page is loaded convert it to text
                                return response.text();
                        })
                        .then(html => {
                                let geneFunction = '';
                                let geneExpression = '';
                                let disease = '';
                                // Initialize the DOM parser
                                const parser = new DOMParser();

                                // Parse the text - dummy document, so we can use JS DOM tree parsing
                                const doc = parser.parseFromString (html, 'text/xml');

                                // You can now even select part of that html as you would in the regular DOM
                                // HTMLCollection is typed as having a forEach method but it does not. (a feature)
                                const ellist: any = doc.getElementsByTagName('comment');
                                for (const element of ellist) {
                                        if (element.getAttribute('type') === 'function') {
                                                geneFunction += `<p>${element.textContent}</p>` ;
                                        } else if (element.getAttribute('type') === 'tissue specificity') {
                                                geneExpression += `<p>${element.textContent}</p>` ;
                                        } else if (element.getAttribute('type') === 'disease') {
                                                const child = element.children[0];
                                                if (child.tagName === 'disease') {
                                                        disease += '<p>';
                                                        disease += `<b>${child.getElementsByTagName('name')[0].textContent}</b>`;
                                                        // tslint:disable-next-line:max-line-length
                                                        disease += `&nbsp;<b>(${child.getElementsByTagName('acronym')[0].textContent}).</b>&nbsp;`;
                                                        disease += `${child.getElementsByTagName('description')[0].textContent}</p>`;
                                                } else {
                                                        disease += `<p>${element.textContent}</p>`;
                                                }
                                        }
                                }
                                let geneSummaryHtml = '';
                                if (geneFunction.length > 0) {
                                        geneSummaryHtml += '<h5 class="card-subtitle">FUNCTION</h5>' + geneFunction;
                                }
                                if (geneExpression.length > 0) {
                                        geneSummaryHtml += '<h5 class="card-subtitle">EXPRESSION</h5>' + geneExpression;
                                }
                                // this document now refers to our page
                                document.getElementById('gene-summary-title').innerText = geneSymbol;
                                document.getElementById('gene-summary').innerHTML = geneSummaryHtml;

                                document.getElementById('gene-diseases-title').innerText = geneSymbol;
                                const diseaseInfoElement = document.getElementById('gene-diseases');
                                if (disease.length > 0) {
                                        diseaseInfoElement.innerHTML = disease;
                                } else {
                                        diseaseInfoElement.innerHTML = '<p>No related diseases found.</p>';
                                }
                                if (geneSymbol in this.omim && this.omim[geneSymbol] !== 'x') {
                                        const omimLink =
                                                `<a href="https://www.omim.org/entry/${this.omim[geneSymbol]}" target="_blank">OMIM</a>`;
                                        diseaseInfoElement.innerHTML += `<p>See also ${omimLink}.</p>`;
                                }

                        })
                        .catch(err => {
                                // this document now refers to our page
                                document.getElementById('gene-summary').textContent = 'Problem fetching the page';
                                console.log('Failed to fetch page: ', err);
                        });
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////
        public setInteractionTable(tableSource) {
                if (tableSource === 'biogrid') {
                        console.log('setting biogrid');
                        if (this.biogridHTMLtable === null) {return; }
                        document.getElementById('gene-interaction-subtitle').innerText = 'interacts with';
                        const oldTable =  document.getElementById('interactant-table');
                        // note the order here replaceChild (newChild, oldChild);
                        oldTable.parentNode.replaceChild(this.biogridHTMLtable, oldTable);
                } else if (tableSource === 'trrust') {
                        console.log('setting trrust');
                        if (this.trrustHTMLtable === null) {return; }
                        const oldTable =  document.getElementById('interactant-table');
                        // note the order here replaceChild (newChild, oldChild);
                        oldTable.parentNode.replaceChild(this.trrustHTMLtable, oldTable);
                } else if (tableSource === 'kegg') {
                        console.log('setting kegg');
                        document.getElementById('gene-interaction-subtitle').innerText = 'participates in pathway(s)';
                        if (this.keggHTMLtable === null) {return; }
                        const oldTable =  document.getElementById('interactant-table');
                        // note the order here replaceChild (newChild, oldChild);
                        oldTable.parentNode.replaceChild(this.keggHTMLtable, oldTable);
                }
        }

        /////////////////////////////////////////////////////////////
        // https://webservice.thebiogrid.org/interactions/?searchNames=true&geneList=MDM2&includeInteractors=true&taxId=9606
        // &max=10&accesskey=xxxxx
        private constructHtmlLinks(pubmedIds) {
                let pubmedHtml = '';
                for (const pubmedId of pubmedIds) {
                        if (pubmedHtml.length > 0) {
                               pubmedHtml += ', ';
                        }
                        pubmedHtml += `<a href="https://pubmed.ncbi.nlm.nih.gov/${pubmedId}" target="_blank">PubMed</a>`;
                }
                return pubmedHtml;
        }
        private createBiogridHTMLTable(rawTable, query) {
                // this does not work,  the object is missing some stuff that  document.createElement takes care of
                // this.biogridHTMLtable = new HTMLTableElement();
                this.biogridHTMLtable = document.createElement('table');
                if (rawTable === null || query === null) {
                        this.biogridHTMLtable.innerHTML = 'No interactants found.';
                } else {
                        const pubmed = {};
                        for (const line of rawTable.split('\n')) {
                                const field = line.split('\t');
                                // entrezA:1 entrezB:2 officialA:7  officialB:8  expSysType:12 (physical or genetic) pubMedID:14
                                if (field[12] !== 'physical') {
                                        continue;
                                }
                                let interactant = field[7];
                                if (interactant === query) {
                                        interactant = field[8];
                                }
                                if (!pubmed.hasOwnProperty(interactant)) {
                                        pubmed[interactant] = new Set();
                                }
                                pubmed[interactant].add(field[14]);
                        }
                        // ? Requires a (for ... in) statement to be filtered with an if statement.
                        // if (someObject.hasOwnProperty(key)) (to protect from iterating over
                        // keys inherited from the prototype
                        for (const geneName in pubmed) {
                                if (!pubmed.hasOwnProperty(geneName) || pubmed[geneName].length < 2) {
                                        continue;
                                }
                                const row: HTMLTableRowElement = this.biogridHTMLtable.insertRow();
                                let  qryString = `https://www.uniprot.org/uniprot/?query=gene:${geneName}`;
                                qryString += '+organism:human+reviewed:yes&sort=score';
                                row.insertCell().innerHTML = `<a href="${qryString}" target="_blank">${geneName}</a>`;
                                row.insertCell().innerHTML = this.constructHtmlLinks(pubmed[geneName].values());
                        }
                }
                const classList: any = document.getElementById('interactant-table').classList;
                for (const elClass of classList) {
                        this.biogridHTMLtable.classList.add(elClass);
                }
                this.biogridHTMLtable.id = 'interactant-table';
        }
        private biogridUpdate(geneName) {
                //  throughputTag If set to 'low or 'high', only interactions with 'Low throughput'
                //  or 'High throughput' in the 'throughput' field will be returned. Interactions with both 'Low throughput'
                //  and 'High throughput' will be returned by either value.
                // https://wiki.thebiogrid.org/doku.php/biogridrest
                // header
                // BioGRID Interaction ID	Entrez Gene Interactor A	Entrez Gene Interactor B
                // BioGRID ID Interactor A	BioGRID ID Interactor B	Systematic Name Interactor A
                // Systematic Name Interactor B	Official Symbol Interactor A	Official Symbol Interactor B
                // Synonyms Interactor A	Synonyms Interactor B	Experimental System	Experimental System Type
                // Author	Pubmed ID	Organism Interactor A	Organism Interactor B	Throughput	Score	Modification
                // Phenotypes	Qualifications	Tags	Source Database
                let url = `https://webservice.thebiogrid.org/interactions/?searchNames=true&geneList=${geneName}`;
                url += '&includeInteractors=true&taxId=9606&throughputTag=low&includeHeader=true';
                url += `&max=100&accesskey=${communication.biogrid}`;
                fetch(url, {mode: 'cors'})
                        .then(response => {
                                // When the page is loaded convert it to text
                                return response.text();
                        })
                        .then(rawTable => {
                                this.createBiogridHTMLTable(rawTable, geneName);
                                this.setInteractionTable('biogrid');
                        })
                        .catch(err => {
                                // this document now refers to our page
                                // document.getElementById('gene-summary').textContent = 'Problem fetching the page';
                                console.log('Failed to fetch biogrid page: ', err);
                                this.createBiogridHTMLTable(null, null);
                                this.setInteractionTable('biogrid');
                       });
        }

        //////////////////////////////////////////////////////////////
        private processTrrustTable(rawTable) {
                this.trrustHTMLtable = document.createElement('table');
                for (const line of rawTable.split('\n')) {
                        // entrezA:1 entrezB:2 officialA:7  officialB:8  expSysType:12 (physical or genetic) pubMedID:14
                        const row: HTMLTableRowElement = this.trrustHTMLtable.insertRow();
                        // row.insertCell(0).innerHTML = this.formatRadioButton(i);
                        // TODO - gene link to entrez, pubmedId to pubmed, OMIM link
                        // index is optional in insertCell
                        for (const field of line.split('\t')) {
                                row.insertCell().innerHTML = field;
                        }
                }
                const classList: any = document.getElementById('interactant-table').classList;
                for (const elClass of classList) {
                        this.trrustHTMLtable.classList.add(elClass);
                }
                this.trrustHTMLtable.id = 'interactant-table';
        }
        // TODO: revive trrust
        private trrustUpdate(geneName, pieceOne) {
                // TP63 targets
                // "url":"https://www.grnpedia.org/trrust/export_tsv.php?tabletype=TF&gene=TP63&species=human"
                // TFs that regulate TP63
                // url = `https://www.grnpedia.org/trrust/export_tsv.php?tabletype=TG&gene=${geneName}&species=human`;
                const  url = pieceOne === '' ? `https://www.grnpedia.org/trrust/export_tsv.php?tabletype=TF&gene=${geneName}&species=human`
                        : `https://www.grnpedia.org/trrust/export_tsv.php?tabletype=TG&gene=${geneName}&species=human`;
                fetch(url, {mode: 'cors'})
                        .then(async response => {
                                // When the page is loaded convert it to text
                                const  retText: string = await response.text();
                                // TODO: do something if no response
                                if (pieceOne === '') {
                                    this.trrustUpdate(geneName, retText);
                                }
                                return retText;
                        })
                        .then(rawTable => {
                                if (pieceOne === '' ) {
                                        return rawTable;
                                } else {
                                        this.processTrrustTable(pieceOne + rawTable);
                                }
                        })
                        .catch(err => {
                                // this document now refers to our page
                                // document.getElementById('gene-summary').textContent = 'Problem fetching the page';
                                console.log('Failed to fetch trrust page: ', err);
                                return '';
                        });
        }

        //////////////////////////////////////////////////////////////
        private createKeggHTMLTable(keggPathwayIds: string) {
                console.log('in kegg table' , keggPathwayIds);
                this.keggHTMLtable = document.createElement('table');
                if (keggPathwayIds === null ||  keggPathwayIds.length === 0 ||
                        this.keggPathwayName === null || this.keggPathwayName.length === 0) {
                        this.keggHTMLtable.innerHTML = 'No pathways found.';
                       
                } else {
                        console.log('in kegg table' , keggPathwayIds.split(';'));
                        // link to formatted pathway info https://www.kegg.jp/dbget-bin/www_bget?pathway:hsa04144
                        let pthwyFound = false;
                        for (const pthwId of keggPathwayIds.split(';')) {
                                console.log(pthwId);
                                if (!this.keggPathwayName.hasOwnProperty(pthwId)) {continue; }
                                pthwyFound = true;
                                console.log(pthwId, this.keggPathwayName[pthwId]);
                                const row: HTMLTableRowElement = this.keggHTMLtable.insertRow();
                                // tslint:disable-next-line:max-line-length
                                const anchor = `<a href="https://www.genome.jp/dbget-bin/www_bget?pathway:hsa${pthwId}" target="_blank">KEGG</a>`;
                                row.insertCell().innerHTML = anchor;
                                row.insertCell().innerHTML = this.keggPathwayName[pthwId];
                        }
                        if (!pthwyFound) {
                                this.keggHTMLtable.innerHTML = 'No pathways found.';
                        }
                }
                const classList: any = document.getElementById('interactant-table').classList;
                for (const elClass of classList) {
                        this.keggHTMLtable.classList.add(elClass);
                }
                this.keggHTMLtable.id = 'interactant-table';
         }
        private keggUpdate(geneName) {

                if (this.keggPathwayIds.hasOwnProperty(geneName)) {
                        this.createKeggHTMLTable(this.keggPathwayIds[geneName]);
                } else {
                        this.createKeggHTMLTable(null);
                }
                this.setInteractionTable('kegg');
        }

        //////////////////////////////////////////////////////////////
        private interactionUpdate(geneSymbol, uniprotId) {
                document.getElementById('gene-interaction-title').innerText = geneSymbol;

                this.biogridHTMLtable = null;
                this.trrustHTMLtable = null;
                this.keggHTMLtable = null;

                // BioGrid - protein-protein interactions
                this.biogridUpdate(geneSymbol); // sets the table when done
                // TRRUST - transcription factors and their targets
                // this.trrustUpdate(geneSymbol, '');
                // KEGG - pathways
                console.log(geneSymbol, ' setting kegg links');
                this.keggUpdate(geneSymbol);
       }
  }
