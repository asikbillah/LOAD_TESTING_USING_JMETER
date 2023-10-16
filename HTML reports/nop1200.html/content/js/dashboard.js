/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.90277777777777, "KoPercent": 0.09722222222222222};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0018452380952380953, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0016666666666666668, 500, 1500, "https://demo.nopcommerce.com/nikon-d5500-dslr"], "isController": false}, {"data": [0.0025, 500, 1500, "https://demo.nopcommerce.com/computers"], "isController": false}, {"data": [0.0016666666666666668, 500, 1500, "https://demo.nopcommerce.com/camera-photo"], "isController": false}, {"data": [0.0, 500, 1500, "https://demo.nopcommerce.com/electronics"], "isController": false}, {"data": [0.005416666666666667, 500, 1500, "https://demo.nopcommerce.com/desktops"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.0016666666666666668, 500, 1500, "https://demo.nopcommerce.com/build-your-own-computer"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7200, 7, 0.09722222222222222, 30236.424583333344, 1, 2039702, 27191.0, 50122.4, 56831.9, 68680.41999999997, 3.336408698944258, 89.42081874571653, 2.458784057434422], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://demo.nopcommerce.com/nikon-d5500-dslr", 1200, 1, 0.08333333333333333, 42996.929999999964, 2, 76164, 44166.5, 60294.5, 63271.65, 69644.93000000001, 0.571818769665205, 29.017497229955012, 0.45693336140209007], "isController": false}, {"data": ["https://demo.nopcommerce.com/computers", 1200, 0, 0.0, 26711.48499999997, 379, 161549, 26072.0, 45118.60000000001, 50763.100000000006, 67404.44, 7.168030583597156, 127.92969916671645, 3.563015202198196], "isController": false}, {"data": ["https://demo.nopcommerce.com/camera-photo", 1200, 2, 0.16666666666666666, 34964.26916666668, 306, 2031507, 32726.0, 50945.1, 57208.15, 67256.87, 0.567646692914019, 12.886365709604487, 0.45138398398455815], "isController": false}, {"data": ["https://demo.nopcommerce.com/electronics", 1200, 2, 0.16666666666666666, 23775.83833333333, 1, 105936, 22197.0, 38262.40000000001, 44618.950000000004, 56829.29, 0.5728139629131599, 10.455454208505953, 0.4545834455094011], "isController": false}, {"data": ["https://demo.nopcommerce.com/desktops", 1200, 0, 0.0, 28236.246666666655, 1083, 101372, 27038.5, 46727.6, 57378.15, 75754.59000000001, 5.237704488712747, 119.05393945622806, 3.9896577160116626], "isController": false}, {"data": ["Test", 1200, 4, 0.3333333333333333, 181418.54749999978, 64288, 2098589, 185483.5, 218995.6, 222189.4, 226846.63, 0.57068450753256, 91.77126757619115, 2.5234138180790953], "isController": true}, {"data": ["https://demo.nopcommerce.com/build-your-own-computer", 1200, 2, 0.16666666666666666, 24733.778333333354, 1039, 2039702, 19617.0, 35772.700000000004, 41883.600000000006, 66999.81000000001, 0.5723923711544773, 16.331230545367106, 0.44364601091409156], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["520", 1, 14.285714285714286, 0.013888888888888888], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 3, 42.857142857142854, 0.041666666666666664], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 3, 42.857142857142854, 0.041666666666666664], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7200, 7, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 3, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 3, "520", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["https://demo.nopcommerce.com/nikon-d5500-dslr", 1200, 1, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["https://demo.nopcommerce.com/camera-photo", 1200, 2, "520", 1, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["https://demo.nopcommerce.com/electronics", 1200, 2, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Network is unreachable: connect", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://demo.nopcommerce.com/build-your-own-computer", 1200, 2, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Software caused connection abort: recv failed", 2, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
