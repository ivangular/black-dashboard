import {Component, OnInit} from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { HttpClient } from '@angular/common/http';

// json import
// https://medium.com/@baerree/angular-7-import-json-14f8bba534af
// not sure why I need to ignore the linter here, because the import seems to be working ok
// @ts-ignore
import communication from './communication.json';


enum columns  {chrom, pos, gt, freqs, annotation, gt_mom, gt_dad, flags}

@Component({
        selector: 'app-dashboard',
        templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit {
        constructor(
            private route: ActivatedRoute,
            private http: HttpClient
         ) {}
        public variant: any;
        public contents: string;
        public contentsEn = '';
        public contentsHr = '';
        public clickedEn = true;
        public clickedHr = false;
        private variantDataIds: any;
        private variantProvenance: any;
        private uniprot: any = null;
        private biogridHTMLtable: any = null;
        private trrustHTMLtable: any = null;
        private keggHTMLtable: any = null;
        private keggPathwayName: any = null;
        private annotExpansion =  {e: 'exonic', intr: 'intronic', s: 'splice', d: 'downstream', u: 'upstream'};

        ngOnInit() {
                // case description here
                this.contentsEn = '';
                this.contentsHr = '';
                // variants: we have threr; the first entry refers to proband, the second to mother, and the third to father
                this.variantProvenance = ['var-proband', 'var-mother', 'var-father'];
                this.variantDataIds = ['vardat-0', 'vardat-1', 'vardat-2', 'vardat-3'];
                this.variant = [];
                // note that the path to here is defined in multipanel-layout.routing.ts
                this.route.params.subscribe(params => {
                        const caseno = params.caseno;
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
                                        this.variant = [];
                                        for (const line of data.split('\n')) {
                                             this.variant.push(line.split('\t'));
                                        }
                                        this.loadVariantTable();
                                });
                        this.http
                                .get(`assets/case_id_resolution_tables/case${caseno}.ids.tsv`, {responseType: 'text'})
                                .subscribe(data => {
                                        this.uniprot = {};
                                        for (const line of data.split('\n')) {
                                             const field = line.split('\t');
                                             this.uniprot[field[0]] = field[1];
                                        }
                                });
                });
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
                        this.variantUpdate(variantId);
                        const geneSymbol = this.variant[variantId][columns.annotation].split(':')[0];
                        let uniprotId = 'unk';
                        console.log(geneSymbol, geneSymbol in this.uniprot);
                        if (geneSymbol in this.uniprot) {
                                uniprotId = this.uniprot[geneSymbol];
                        }
                        this.geneInfoUpdate(geneSymbol, uniprotId);
                        this.interactionUpdate(geneSymbol, uniprotId);
                }
                e.stopPropagation();
        }


        private loadVariantTable() {
                document.getElementById('variant-count').innerText = `number: ${this.variant.length}`;
                const table: HTMLTableElement = document.getElementById('variant-table') as HTMLTableElement;
                for (let i = 0; i < this.variant.length; i++) {
                // for (let i = 0; i < 50; i++) {
                        // Index (i here) is required in Firefox and Opera, optional in IE, Chrome and Safari.
                        const row: HTMLTableRowElement = table.insertRow(i);
                        row.setAttribute('id', `var-${i}`);
                        row.setAttribute('class', 'tr-clickable');
                        // row.insertCell(0).innerHTML = this.formatRadioButton(i);
                        const annotFields = this.variant[i][columns.annotation].split(':');
                        let location = '';
                        if (annotFields.length > 2 ) {
                                if (annotFields[2] in this.annotExpansion) {
                                        location = this.annotExpansion[annotFields[2]];
                                } else {
                                        location = annotFields[2];
                                }
                        }
                        row.insertCell(0).innerHTML = this.variant[i][columns.chrom];
                        row.insertCell(1).innerHTML = annotFields[0];
                        row.insertCell(2).innerHTML = location;
                        row.insertCell(3).innerHTML = this.variant[i][columns.gt];
                 }
                // count on event propagation to get to table, whichever row was clicked
                // (I do not want 1000 event listeners on the page)
                table.addEventListener('click',
                        this.onVariantClickHandler.bind(this),
                        false);
        }

        public descriptionUpdate() {
                document.getElementById('case-description').textContent = this.contents;
                // this.myChartData.data.datasets[0].data = this.data;
                // this.myChartData.update();
        }

        private fillVariantDetails(element, variantId, sourceIndex) {
                for (let i = 0; i < this.variantDataIds.length; i++) {
                       element.getElementsByClassName(this.variantDataIds[i])[0].textContent =
                                this.variant[variantId][sourceIndex][i];
                }
        }

        private variantUpdate(variantId) {
                // I AM HERE <-------
                // loop over sources/provenance: proband, mother, father
                for (let sourceIndex = 0; sourceIndex < this.variantProvenance.length; sourceIndex++) {
                     const variantDetails = document.getElementById(this.variantProvenance[sourceIndex]);
                     this.fillVariantDetails.bind(this)(variantDetails, variantId, sourceIndex);
                }
        }

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
                                if (disease.length > 0) {
                                    document.getElementById('gene-diseases').innerHTML = disease;
                                } else {
                                    document.getElementById('gene-diseases').innerHTML = '<p>No related diseases found.</p>';
                                }
                        })
                        .catch(err => {
                                // this document now refers to our page
                                document.getElementById('gene-summary').textContent = 'Problem fetching the page';
                                console.log('Failed to fetch page: ', err);
                        });
       }

        public setInteractionTable(tableSource) {
                if (tableSource === 'biogrid') {
                        console.log('setting biogrid');
                        if (this.biogridHTMLtable === null) {return; }
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
                        if (this.keggHTMLtable === null) {return; }
                        const oldTable =  document.getElementById('interactant-table');
                        // note the order here replaceChild (newChild, oldChild);
                        oldTable.parentNode.replaceChild(this.keggHTMLtable, oldTable);
                }
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////
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
        private processBiogridTable(rawTable, query) {
                // this does not work,  the object is missing some stuff that  document.createElement takes care of
                // this.biogridHTMLtable = new HTMLTableElement();
                this.biogridHTMLtable = document.createElement('table');
                const pubmed = {};
                for (const line of rawTable.split('\n')) {
                        const field = line.split('\t');
                        // entrezA:1 entrezB:2 officialA:7  officialB:8  expSysType:12 (physical or genetic) pubMedID:14
                        if (field[12] !== 'physical') { continue; }
                        let interactant = field[7];
                        if (interactant === query) {
                                interactant = field[8];
                        }
                        if (!pubmed.hasOwnProperty(interactant)) {pubmed[interactant] = new Set(); }
                        pubmed[interactant].add(field[14]);
                }
                // ? Requires a (for ... in) statement to be filtered with an if statement.
                // if (someObject.hasOwnProperty(key)) (to protect from iterating over
                // keys inherited from the prototype
                for (const geneName in pubmed) {
                        if (!pubmed.hasOwnProperty(geneName) || pubmed[geneName].size < 2 ) {continue; }
                        const row: HTMLTableRowElement = this.biogridHTMLtable.insertRow();
                        // row.insertCell(0).innerHTML = this.formatRadioButton(i);
                        // TODO - gene link to entrez, pubmedId to pubmed, OMIM link
                        row.insertCell().innerHTML = geneName;
                        row.insertCell().innerHTML = this.constructHtmlLinks(pubmed[geneName].values());
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
                                this.processBiogridTable(rawTable, geneName);
                                const oldTable =  document.getElementById('interactant-table');
                               // note the order here replaceChild (newChild, oldChild);
                                oldTable.parentNode.replaceChild(this.biogridHTMLtable, oldTable);
                        })
                        .catch(err => {
                                // this document now refers to our page
                                // document.getElementById('gene-summary').textContent = 'Problem fetching the page';
                                console.log('Failed to fetch biogrid page: ', err);
                        });
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////////
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

        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        private processKeggTable() {
                this.keggHTMLtable = document.createElement('table');
                if (this.keggPathwayName === null || this.keggPathwayName.length === 0) {return; }
                // link to formatted pathway info https://www.kegg.jp/dbget-bin/www_bget?pathway:hsa04144
                // TODO make links, target blank
                for (const pthwId in this.keggPathwayName) {
                        if (!this.keggPathwayName.hasOwnProperty(pthwId)) {continue; }
                        console.log(pthwId, this.keggPathwayName[pthwId]);
                        const row: HTMLTableRowElement = this.keggHTMLtable.insertRow();
                        // tslint:disable-next-line:max-line-length
                        row.insertCell().innerHTML = `<a href="https://www.genome.jp/dbget-bin/www_bget?${pthwId}" target="_blank">KEGG</a>`;
                        row.insertCell().innerHTML = this.keggPathwayName[pthwId];
                }
                const classList: any = document.getElementById('interactant-table').classList;
                for (const elClass of classList) {
                        this.keggHTMLtable.classList.add(elClass);
                }
                this.keggHTMLtable.id = 'interactant-table';
        }
        // https://cors-anywhere.herokuapp.com/https://www.ebi.ac.uk/intact/interactors/id:P02763*
        private keggPathwayInfo(keggPthwyIdList) {
                // download pathway info as a flatfile
                // http://rest.kegg.jp/get/pathway:hsa04144
                if (keggPthwyIdList.length === 0) {
                        this.processKeggTable();
                } else {
                        const keggPthwyId =  keggPthwyIdList.pop();
                        const url = `https://cors-anywhere.herokuapp.com/http://rest.kegg.jp/get/pathway:${keggPthwyId}`;
                        fetch(url, {mode: 'cors'})
                                .then(response => {
                                        // When the page is loaded convert it to text
                                        return response.text();
                                })
                                .then(idResponse => {
                                        // find the name of the pathway
                                        for (const line of idResponse.split('\n')) {
                                                if (line.substr(0, 4) === 'NAME') {
                                                       this.keggPathwayName[keggPthwyId]  =  line
                                                                        .split('-')[0]
                                                                        .replace('NAME', '').trim();
                                                       break;
                                                }
                                        }
                                        this.keggPathwayInfo(keggPthwyIdList);
                                })
                                .catch(err => {
                                        // this document now refers to our page
                                        // document.getElementById('gene-summary').textContent = 'Problem fetching the page';
                                        console.log('Failed to fetch keggPathwayId: ', err);
                                        return '';
                                });

                }
        }
        private keggPathwaysFromKeggGene(keggGeneId) {
                // get pathways related to gene id:  http://rest.kegg.jp/link/pathway/hsa:10993
                const  url = `https://cors-anywhere.herokuapp.com/http://rest.kegg.jp/link/pathway/hsa:${keggGeneId}`;
                fetch(url, {mode: 'cors'})
                        .then(response => {
                                // When the page is loaded convert it to text
                                return response.text();
                        })
                        .then(idResponse => {
                                // the format is somehting like    up:P02763	hsa:5004
                                // const geneId = idResponse.split('\t')[1].split(':')[1];
                                const pthwyIdList = [];
                                for (const line of idResponse.trim().split('\n')) {
                                     const pthwId = line.split('\t')[1].split(':')[1].trim();
                                     pthwyIdList.push(pthwId);
                                }
                                this.keggPathwayName = {};
                                this.keggPathwayInfo(pthwyIdList);
                        })
                        .catch(err => {
                                // this document now refers to our page
                                // document.getElementById('gene-summary').textContent = 'Problem fetching the page';
                                console.log('Failed to fetch keggPathwayId: ', err);
                                return '';
                        });
                return;
        }
        private keggIdFromUniprot(uniprotId) {
                // get KEGG id: http://rest.kegg.jp/conv/genes/uniprot:P02763
                // get pathways related to gene id:  http://rest.kegg.jp/link/pathway/hsa:10993
                // get all genes related to pathway id: http://rest.kegg.jp/link/hsa/pathway:hsa01200
                // link to  gene info https://www.kegg.jp/dbget-bin/www_bget?hsa:10993
                const  url = `https://cors-anywhere.herokuapp.com/http://rest.kegg.jp/conv/genes/uniprot:${uniprotId}`;
                fetch(url, {mode: 'cors'})
                        .then(response => {
                                // When the page is loaded convert it to text
                                return response.text();
                        })
                        .then(idResponse => {
                                // the format is somehting like    up:P02763	hsa:5004
                                const geneId = idResponse.split('\t')[1].split(':')[1].trim();
                                this.keggPathwaysFromKeggGene(geneId);
                        })
                        .catch(err => {
                                // this document now refers to our page
                                // document.getElementById('gene-summary').textContent = 'Problem fetching the page';
                                return '';
                        });
                return;
        }
        private keggUpdate(uniprotId) {
              this.keggIdFromUniprot(uniprotId);
        }
        private interactionUpdate(geneSymbol, uniprotId) {
                document.getElementById('gene-interaction-title').innerText = geneSymbol;
                // TODO: clean handling in no-response case for all of the below
                this.biogridHTMLtable = null;
                this.trrustHTMLtable = null;
                this.keggHTMLtable = null;
                this.keggPathwayName = null;

                // BioGrid - protein-protein interactions
                this.biogridUpdate(geneSymbol); // sets the table when done
                // TRRUST - transcription factors and their targets
                // this.trrustUpdate(geneSymbol, '');
                // KEGG - pathways
                if (uniprotId !== 'unk') {
                        this.keggUpdate(uniprotId);
                }
        }
  }
