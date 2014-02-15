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
      var dept_list = ['Executive', 'Finance', 'Human Resources', 'Marketing', 'Sales', 'Technical Support', 'Information Technology', 'Facilities'];
      var color_list = ['#253494', '#2c7fb8', '#41b6c4', '#006837', '#31a354', '#78c679', '#993404', '#d95f0e'];

      // first chart
      var cum_var = [];
      for ( d = 0; d < dept_list.length; d++ ) {
        var dept = dept_list[d];
        var series = {
          name: dept,
          id: dept,
          marker: {
            enabled: false
          },
          lineWidth: 2.5,
          color: color_list[d],
          data: []};
        var total_budget = 0;
        var total_actual = 0;
        for ( i = 0; i < month_list.length - 1; i++ ) {
          total_budget += depts[dept][month_list[i]]['budget'];
          total_actual += depts[dept][month_list[i]]['actual'];
          series.data.push(((total_actual / total_budget) - 1) * 100);
        }
        series.data.push(null);
        cum_var.push(series);
      }

      $("#line-chart").highcharts({
        chart: {
          defaultSeriesType: "spline",
          plotBackgroundColor: null,
          plotBorderWidth: null,
          plotShadow: false,
          style: {
            fontFamily: 'Helvetica, Arial, sans-serif'
          }
        },
        title: {
          text: 'Year-to-date total variance from budget',
          x: -20,
          style: {
            fontSize: '12px'
          }
        },
        credits: {
          enabled: false
        },
        xAxis: {
          categories: cat_list
        },
        yAxis: {
          title: {
            text: 'Cumulative variance',
            style: {
              fontSize: '10px',
              fontWeight: 'normal'
            }
          },
          plotLines: [{
            color: '#333333',
            value: 0,
            width: 2,
            zIndex: 3
          }],
          labels: {
            format: '{value:.0f}%'
          },
          min: -28,
          max: 32,
          endOnTick: false,
          startOnTick: false
        },
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle',
          borderWidth: 0
        },
        series: cum_var
      });

      // second chart
      for ( d = 0; d < dept_list.length; d++ ) {
        $("#dept-titles").append("<div class='dept-title-row'><div class='dept-title-row-text'>" + dept_list[d] + "<div></div>");
      }
      for ( m = 0; m < month_list.length; m++ ) {
        $("#month-titles-header").append("<div class='month-titles-text'>" + cat_list[m] + "</div>")
        var month = month_list[m];
        var elemid = "diff-" + month;
        $("#diff-chart").append("<div id='" + elemid + "' style='width: 7.5%; height: 240px; float: left;'></div>");
        var month_vals = [];
        for ( d = 0; d < dept_list.length; d++ ) {
          var dept = dept_list[d];
          var cur_var = ((months[month][dept]['actual'] / months[month][dept]['budget']) - 1) * 100;
          if ( cur_var > 0 ) {
            month_vals.push({y: cur_var, color: '#de2d26', borderWidth: 0});
          } else {
            month_vals.push({y: cur_var, color: '#3182bd', borderWidth: 0});
          }
        }
        $("#" + elemid).highcharts({
          chart: {
            type: 'bar',
            spacing: [0, 0, 0, 0]
          },
          title: {
            text: ''
          },
          yAxis: {
            title: {
              text: ''
            },
            labels: {
              enabled: false
            },
            gridLineColor: 'transparent',
            plotLines: [{
              color: '#dddddd',
              value: 0,
              width: 2,
              zIndex: 3
            }],
            min: -35,
            max: 45,
            endOnTick: false,
            startOnTick: false
          },
          xAxis: {
            labels: {
              enabled: false
            },
            lineWidth: 0,
            minorGridLineWidth: 0,
            lineColor: 'transparent',
            tickLength: 0
          },
          legend: {
            enabled: false
          },
          credits: {
            enabled: false
          },
          series: [{
            data: month_vals
          }]
        });
      }

    });

});
