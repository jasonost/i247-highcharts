$(document).ready(function(){

     // Initialize objects to store aggregate value read from the input file.
     var depts = {};
     var months = {};

    // ajax call to data from the csv file
    $.get('_data/expenditures.csv', function (data) {

      var lines = data.split("\n");
      // loop through each line using $.each
      $.each(lines, function(lineNo, line) {

        // turn each line into an array: dept, month, budget, actual
        var items = line.split(',');

        // the first line gives the months
        if ( lineNo > 0 ) {

          // name the items
          var dept = items[0], 
              month = items[1],
              budget = parseFloat(items[2]),
              actual = parseFloat(items[3]);

          // double November
          if ( month == 'Nov' ) {
            actual *= 2;
          }

          // fill dictionaries
          if ( !(dept in depts) ) {
            depts[dept] = {};
          };
          depts[dept][month] = {
            'budget': budget,
            'actual': actual
          };

          if ( !(month in months) ) {
            months[month] = {};
          };
          months[month][dept] = {
            'budget': budget,
            'actual': actual
          };

        };

      });

      // Chart 1 specifics
      var month_list = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var cat_list = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov*', 'Dec'];
      var cat_list_short = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N*', 'D'];
      var dept_list = ['Executive', 'Finance', 'Human Resources', 'Marketing', 'Sales', 'Technical Support', 'Information Technology', 'Facilities'];
      var chart_list = ['exec-chart', 'finance-chart', 'hr-chart', 'marketing-chart', 'sales-chart', 'techsupport-chart', 'it-chart', 'facilities-chart'];
      var color_list = ['#253494', '#2c7fb8', '#41b6c4', '#006837', '#31a354', '#78c679', '#993404', '#d95f0e'];

      // overall chart
      var budget_bars = [];
      var actual_bars = [];
      var var_line = [];
      for ( m = 0; m < month_list.length; m++ ) {
        var cur_budget = 0;
        var cur_actual = 0;
        for ( d in depts ) {
          cur_budget += depts[d][month_list[m]]['budget'];
          if ( m < 11 ) {
            cur_actual += depts[d][month_list[m]]['actual'];
          };
        };
        budget_bars.push(cur_budget);
        actual_bars.push(cur_actual);
        if ( m < 11 ) {
          var total_budget = 0;
          var total_actual = 0;
          $.each(budget_bars,function() {total_budget += this;});
          $.each(actual_bars,function() {total_actual += this;});
          var ytd_var = ((total_actual / total_budget) - 1) * 100;
          var_line.push(ytd_var);
        };
      };

      $("#overall-chart").highcharts({
        chart: {
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          style: {
            fontFamily: 'Helvetica, Arial, sans-serif'
          },
          spacing: [0, 0, 0, 0]
        },
        title: {
          text: 'Overall Company Budget vs. Actual',
          style: {
            fontSize: '12px',
            fontWeight: 'bold'
          }
        },
        credits: {
          enabled: false
        },
        plotOptions: {
          column: {
            groupPadding: 0.12,
            borderWidth: 0,
            pointPadding: 0
          }
        },
        xAxis: {
          categories: cat_list,
          labels: {
            rotation: 270,
            style: {
              fontSize: '10px'
            }
          }
        },
        yAxis: [{ // primary yAxis
          title: {
            text: 'Budget and actual, in thousands of dollars',
            style: {
              color: '#333333',
              fontSize: '10px',
              fontWeight: 'normal'
            }
          },
          labels: {
            style: {
              color: '#333333',
              fontSize: '8px',
              fontWeight: 'normal'
            }
          },
          min: 0,
          max: 2000,
          startOnTick: false,
          endOnTick: false
        }, { // secondary yAxis
          title: {
            text: 'Cumulative year-to-date variance',
            style: {
              color: '#de2d26',
              fontSize: '10px',
              fontWeight: 'normal'
            }
          },
          labels: {
            format: '{value:.0f}%',
            style: {
              color: '#de2d26',
              fontSize: '8px',
              fontWeight: 'normal'
            }
          },
          opposite: true,
          min: 0,
          max: 8,
          startOnTick: false,
          endOnTick: false,
          tickInterval: 2
        }],
        legend: {
          borderWidth: 0,
          backgroundColor: '#FFFFFF',
          padding: 4,
          symbolHeight: 8,
          itemStyle: {
            fontSize: '10px'
          }
        },
        series: [{
          name: 'Budget',
          color: '#333333',
          type: 'column',
          borderWidth: 0,
          data: budget_bars
        }, {
          name: 'Actual',
          color: '#999999',
          type: 'column',
          borderWidth: 0,
          data: actual_bars
        }, {
          name: 'Variance',
          color: '#de2d26',
          type: 'spline',
          marker: {
            enabled: false
          },
          yAxis: 1,
          lineWidth: 4,
          data: var_line
        }]
      });

      // create small dept-level charts
      for ( d = 0; d < dept_list.length; d++ ) {
        var dept = dept_list[d];
        var chart_location = chart_list[d];
        var budget_bars = [];
        var actual_bars = [];
        var var_line = [];
        for ( m = 0; m < month_list.length; m++ ) {
          var cur_budget = depts[dept][month_list[m]]['budget'];
          var cur_actual = depts[dept][month_list[m]]['actual'];
          budget_bars.push(cur_budget);
          if ( m < 11 ) {
            actual_bars.push(cur_actual);
            var total_budget = 0;
            var total_actual = 0;
            $.each(budget_bars,function() {total_budget += this;});
            $.each(actual_bars,function() {total_actual += this;});
            var ytd_var = ((total_actual / total_budget) - 1) * 100;
            var_line.push(ytd_var);
          };
        };
        $("#" + chart_location).highcharts({
          chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            style: {
              fontFamily: 'Helvetica, Arial, sans-serif'
            },
            spacing: [0, 0, 0, 0],
            margin: [18, 22, 0, 22]
          },
          title: {
            text: dept,
            style: {
              fontSize: '9px',
              fontWeight: 'bold'
            }
          },
          credits: {
            enabled: false
          },
          plotOptions: {
            column: {
              groupPadding: 0.1,
              borderWidth: 0,
              pointPadding: 0
            }
          },
          xAxis: {
            categories: cat_list_short,
            labels: {
              y: -42,
              style: {
                fontSize: '7px',
                fontWeight: 'bold'
              }
            }
          },
          yAxis: [{ // primary yAxis
            title: {
              text: ''
            },
            labels: {
              style: {
                color: '#333333',
                fontSize: '6px',
                fontWeight: 'normal'
              }
            },
            plotLines: [{
              color: '#333333',
              value: 0,
              width: 1,
              zIndex: 3
            }],
            gridLineColor: '#EEEEEE',
            gridLineWidth: 0.5,
            min: -580,
            max: 660,
            tickInterval: 200,
            startOnTick: false,
            endOnTick: false
          }, { // secondary yAxis
            title: {
              text: ''
            },
            labels: {
              format: '{value:.0f}%',
              style: {
                color: '#de2d26',
                fontSize: '6px',
                fontWeight: 'normal'
              }
            },
            gridLineWidth: 0,
            opposite: true,
            min: -28,
            max: 33,
            startOnTick: false,
            endOnTick: false,
            tickInterval: 10
          }],
          legend: {
            enabled: false
          },
          series: [{
            name: 'Budget',
            color: '#333333',
            type: 'column',
            borderWidth: 0,
            data: budget_bars
          }, {
            name: 'Actual',
            color: '#999999',
            type: 'column',
            borderWidth: 0,
            data: actual_bars
          }, {
            name: 'Variance',
            color: '#de2d26',
            type: 'spline',
            marker: {
              enabled: false
            },
            yAxis: 1,
            lineWidth: 2,
            data: var_line
          }]
        });
      };

    });

});
