import {Component, OnInit} from '@angular/core';
import Chart from 'chart.js';


@Component({
        selector: 'app-dashboard',
        templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit {
        public canvas: any;
        public ctx;
        public variant: any;
        public contents: string;
        public contentsEn: string;
        public contentsHr: string;
        public clickedEn = false;
        public clickedHr = true;
        private variantDataIds: any;
        private variantProvenance: any;
        constructor() {
        }

        ngOnInit() {

                const gradientChartOptionsConfigurationWithTooltipRed: any = {
                        maintainAspectRatio: false,
                        legend: {
                                display: false
                        },

                        tooltips: {
                                backgroundColor: '#f5f5f5',
                                titleFontColor: '#333',
                                bodyFontColor: '#666',
                                bodySpacing: 4,
                                xPadding: 12,
                                mode: 'nearest',
                                intersect: 0,
                                position: 'nearest'
                        },
                        responsive: true,
                        scales: {
                                yAxes: [{
                                        barPercentage: 1.6,
                                        gridLines: {
                                                drawBorder: false,
                                                color: 'rgba(29,140,248,0.0)',
                                                zeroLineColor: 'transparent',
                                        },
                                        ticks: {
                                                suggestedMin: 60,
                                                suggestedMax: 125,
                                                padding: 20,
                                                fontColor: '#9a9a9a'
                                        }
                                }],

                                xAxes: [{
                                        barPercentage: 1.6,
                                        gridLines: {
                                                drawBorder: false,
                                                color: 'rgba(233,32,16,0.1)',
                                                zeroLineColor: 'transparent',
                                        },
                                        ticks: {
                                                padding: 20,
                                                fontColor: '#9a9a9a'
                                        }
                                }]
                        }
                };

                const gradientChartOptionsConfigurationWithTooltipGreen: any = {
                        maintainAspectRatio: false,
                        legend: {
                                display: false
                        },

                        tooltips: {
                                backgroundColor: '#f5f5f5',
                                titleFontColor: '#333',
                                bodyFontColor: '#666',
                                bodySpacing: 4,
                                xPadding: 12,
                                mode: 'nearest',
                                intersect: 0,
                                position: 'nearest'
                        },
                        responsive: true,
                        scales: {
                                yAxes: [{
                                        barPercentage: 1.6,
                                        gridLines: {
                                                drawBorder: false,
                                                color: 'rgba(29,140,248,0.0)',
                                                zeroLineColor: 'transparent',
                                        },
                                        ticks: {
                                                suggestedMin: 50,
                                                suggestedMax: 125,
                                                padding: 20,
                                                fontColor: '#9e9e9e'
                                        }
                                }],

                                xAxes: [{
                                        barPercentage: 1.6,
                                        gridLines: {
                                                drawBorder: false,
                                                color: 'rgba(0,242,195,0.1)',
                                                zeroLineColor: 'transparent',
                                        },
                                        ticks: {
                                                padding: 20,
                                                fontColor: '#9e9e9e'
                                        }
                                }]
                        }
                };

                const gradientBarChartConfiguration: any = {
                        maintainAspectRatio: false,
                        legend: {
                                display: false
                        },

                        tooltips: {
                                backgroundColor: '#f5f5f5',
                                titleFontColor: '#333',
                                bodyFontColor: '#666',
                                bodySpacing: 4,
                                xPadding: 12,
                                mode: 'nearest',
                                intersect: 0,
                                position: 'nearest'
                        },
                        responsive: true,
                        scales: {
                                yAxes: [{

                                        gridLines: {
                                                drawBorder: false,
                                                color: 'rgba(29,140,248,0.1)',
                                                zeroLineColor: 'transparent',
                                        },
                                        ticks: {
                                                suggestedMin: 60,
                                                suggestedMax: 120,
                                                padding: 20,
                                                fontColor: '#9e9e9e'
                                        }
                                }],

                                xAxes: [{

                                        gridLines: {
                                                drawBorder: false,
                                                color: 'rgba(29,140,248,0.1)',
                                                zeroLineColor: 'transparent',
                                        },
                                        ticks: {
                                                padding: 20,
                                                fontColor: '#9e9e9e'
                                        }
                                }]
                        }
                };

                this.canvas = document.getElementById('chartLineRed');
                this.ctx = this.canvas.getContext('2d');

                let gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

                gradientStroke.addColorStop(1, 'rgba(233,32,16,0.2)');
                gradientStroke.addColorStop(0.4, 'rgba(233,32,16,0.0)');
                gradientStroke.addColorStop(0, 'rgba(233,32,16,0)'); // red colors

                let data = {
                        labels: ['JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
                        datasets: [{
                                label: 'Data',
                                fill: true,
                                backgroundColor: gradientStroke,
                                borderColor: '#ec250d',
                                borderWidth: 2,
                                borderDash: [],
                                borderDashOffset: 0.0,
                                pointBackgroundColor: '#ec250d',
                                pointBorderColor: 'rgba(255,255,255,0)',
                                pointHoverBackgroundColor: '#ec250d',
                                pointBorderWidth: 20,
                                pointHoverRadius: 4,
                                pointHoverBorderWidth: 15,
                                pointRadius: 4,
                                data: [80, 100, 70, 80, 120, 80],
                        }]
                };

                let myChart = new Chart(this.ctx, {
                        type: 'line',
                        data,
                        options: gradientChartOptionsConfigurationWithTooltipRed
                });


                this.canvas = document.getElementById('chartLineGreen');
                this.ctx = this.canvas.getContext('2d');


                gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

                gradientStroke.addColorStop(1, 'rgba(66,134,121,0.15)');
                gradientStroke.addColorStop(0.4, 'rgba(66,134,121,0.0)'); // green colors
                gradientStroke.addColorStop(0, 'rgba(66,134,121,0)'); // green colors

                data = {
                        labels: ['JUL', 'AUG', 'SEP', 'OCT', 'NOV'],
                        datasets: [{
                                label: 'My First dataset',
                                fill: true,
                                backgroundColor: gradientStroke,
                                borderColor: '#00d6b4',
                                borderWidth: 2,
                                borderDash: [],
                                borderDashOffset: 0.0,
                                pointBackgroundColor: '#00d6b4',
                                pointBorderColor: 'rgba(255,255,255,0)',
                                pointHoverBackgroundColor: '#00d6b4',
                                pointBorderWidth: 20,
                                pointHoverRadius: 4,
                                pointHoverBorderWidth: 15,
                                pointRadius: 4,
                                data: [90, 27, 60, 12, 80],
                        }]
                };

                myChart = new Chart(this.ctx, {
                        type: 'line',
                        data,
                        options: gradientChartOptionsConfigurationWithTooltipGreen

                });


                const chartLabels = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                /////////////////////////////////////////////////
                // case description here
                this.contentsEn = '‘Curiouser and curiouser!’ cried Alice (she was so much surprised, that for the moment she quite ' +
                        // tslint:disable-next-line:max-line-length
                        'forgot how to speak good English); ‘now I’m opening out like the largest telescope that ever was! Good-bye, feet!’ ' +
                        '(for when she looked down at her feet, they seemed to be almost out of sight, they were getting so far off).';
                this.contentsHr = '  - ¡Curiorífico y curiorífico! - exclamó Alicia (estaba tan sorprendida, que por un momento se ' +
                        // tslint:disable-next-line:max-line-length
                        'olvidó hasta de hablar correctamente)- . ¡Ahora me estoy estirando como el telescopio más largo que haya existido ' +
                        'jamás! ¡Adiós, pies! - gritó, porque cuando miró hacia abajo vio que sus pies quedaban ya tan lejos que parecía' +
                        ' fuera a perderlos de vista- . ';
                // variants: we have threr; the first entry refers to proband, the second to mother, and the third to father
                this.variantProvenance = ['var-proband', 'var-mother', 'var-father'];
                this.variantDataIds = ['vardat-0', 'vardat-1', 'vardat-2', 'vardat-3'];
                this.variant = [
                        [['-',  '-',  '-', '-'], ['-',  '-',  '-', '-'], ['-',  '-',  '-', '-']],
                        [[ 'A',  'T', '-', '200'], ['A',  'A',  '-', '175'], ['T',  'T',  '-', '215']],
                        [[ 'G',  'G', '-', '155'], ['G',  'C',  '-', '100'], ['G',  'C',  '-', '100']]
                ];
                this.loadVariantTable();
                /////////////////////////////////////////////////
                this.canvas = document.getElementById('CountryChart');
                this.ctx = this.canvas.getContext('2d');
                gradientStroke = this.ctx.createLinearGradient(0, 230, 0, 50);

                gradientStroke.addColorStop(1, 'rgba(29,140,248,0.2)');
                gradientStroke.addColorStop(0.4, 'rgba(29,140,248,0.0)');
                gradientStroke.addColorStop(0, 'rgba(29,140,248,0)'); // blue colors


                myChart = new Chart(this.ctx, {
                        type: 'bar',
                        responsive: true,
                        legend: {
                                display: false
                        },
                        data: {
                                labels: ['USA', 'GER', 'AUS', 'UK', 'RO', 'BR'],
                                datasets: [{
                                        label: 'Countries',
                                        fill: true,
                                        backgroundColor: gradientStroke,
                                        hoverBackgroundColor: gradientStroke,
                                        borderColor: '#1f8ef1',
                                        borderWidth: 2,
                                        borderDash: [],
                                        borderDashOffset: 0.0,
                                        data: [53, 20, 10, 80, 100, 45],
                                }]
                        },
                        options: gradientBarChartConfiguration
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
                        console.log(e);
                        console.log('variantId: ' + variantId);
                        this.variantUpdate(variantId);
                        this.geneInfoUpdate(7157);
                 }
                 e.stopPropagation();
        }


        private loadVariantTable() {
                const table: HTMLTableElement = document.getElementById('variant-table') as HTMLTableElement;
                const probandIndex = 0;
                for (let i = 0; i < this.variant.length; i++) {
                        // Index (i here) is required in Firefox and Opera, optional in IE, Chrome and Safari.
                        const row: HTMLTableRowElement = table.insertRow(i);
                        row.setAttribute('id', `var-${i}`);
                        row.setAttribute('class', 'tr-clickable');
                         // row.insertCell(0).innerHTML = this.formatRadioButton(i);
                        row.insertCell(0).innerHTML = this.variant[i][probandIndex][1];
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
                // loop over sources/provenance: proband, mother, father
                for (let sourceIndex = 0; sourceIndex < this.variantProvenance.length; sourceIndex++) {
                     const variantDetails = document.getElementById(this.variantProvenance[sourceIndex]);
                     this.fillVariantDetails.bind(this)(variantDetails, variantId, sourceIndex);
                }
        }

        private getGeneInfo(geneId) {
                // this trick did not work for plain javscript fetch (empty response body)
                // const url = `https://cors-anywhere.herokuapp.com/https://www.ncbi.nlm.nih.gov/gene/${geneId}`;
                // note this: http://lindenb.github.io/pages/cors/index.html (bioinf services supporting CORS)
                // const url = `https://www.ncbi.nlm.nih.gov/gene/${geneId}`;
                const url = `https://www.uniprot.org/uniprot/P02763.xml`;
                // mode cors is actually the default - the problem is on the server side
                fetch(url, {mode: 'cors'})
                        .then(response => {
                                // When the page is loaded convert it to text
                                return response.text();
                        })
                        .then(html => {

                                // Initialize the DOM parser
                                const parser = new DOMParser();

                                // Parse the text
                                const doc = parser.parseFromString (html, 'text/xml');

                                // You can now even select part of that html as you would in the regular DOM
                                // HTMLCollection is typed as having a forEach method but it does not. (a feature)
                                const ellist: any = doc.getElementsByTagName('comment');
                                for (const element of ellist) {
                                        if (element.getAttribute('type') === 'function') {
                                                console.log(element.textContent);
                                                document.getElementById('gene-summary').textContent = element.textContent;
                                                return element.textContent;
                                        }
                                }
                                return 'no summary element found';
                        })
                        .catch(err => {
                                document.getElementById('gene-summary').textContent = 'Problem fetching the page';
                                console.log('Failed to fetch page: ', err);
                        });

        }

        private geneInfoUpdate(geneId) {
                this.getGeneInfo(geneId);
        }
}
