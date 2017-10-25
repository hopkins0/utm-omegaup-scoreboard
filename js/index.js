$(function() {
  /* Code for the jumbotron
   * Code to scroll the background image
   */
  var jumboHeight = $('.jumbotron').outerHeight();
  function parallax(){
      var scrolled = $(window).scrollTop();
      $('.bg').css('height', (jumboHeight-scrolled) + 'px');
  }
  $(window).scroll(function(e){
      parallax();
  });

  var USERS = [];
  var API_URL = 'http://mictlan.utm.mx/api';
  var COLORS = [ '#808080', '#00FF00', '#03A89E', '#0000FF', '#aa00aa', '#FF8C00', '#FF0000' ];

  $.ajax({
      beforeSend: function(xhr){
        if (xhr.overrideMimeType)
        {
          xhr.overrideMimeType("application/json");
        }
      },
      url: './js/users.json',
      contentType: "application/json",
      
      success: function(data) {
        USERS = data.data;
        index();
      }});


  function createCellHeaderTable(id, value) {
    return ['<th ', 'id="general-', id, '" class="text-center">',
              '<div class="table-username">' , value, '</div>',
            '</th>'].join('');
  }

  function createRowProblem(problem, numPrevUsers) {
    return ['<tr class="problem" id="general-' + problem.alias +'">',
              '<th scope="row" class="problem-title">',
                '<a href="https://omegaup.com/arena/problem/'+ problem.alias + '">' + problem.title + '</a>',
              '</th>', 
              '<td id="general-' + problem.alias +'-nsolved" class="text-center">0</td>',
            '</tr>'].join('');
  }

  function findName(username) {
    var _users = USERS.filter(user => user.username == username);

    if (_users.length > 0)
      return _users[ 0 ];
    return "";
  }

  function getColor(minProblems, diff, userProblems) {
    for (var i = 0; i < COLORS.length; i++) {
      if (minProblems + i*diff >= userProblems){
        return i;
      }
    }
    return COLORS.length - 1;
  }

  function index() {
    $.ajax({
      type: 'POST',
      url: API_URL + '/api/omegaup/users/problemssolved',
      beforeSend: function(xhr){
        if (xhr.overrideMimeType)
        {
          xhr.overrideMimeType("application/json");
        }
      },
      data: JSON.stringify ({usernames: USERS.map(x => x.username)}),
      contentType: "application/json",
      dataType: 'json',

      success: function(data) {
        data.users.map(function (user) {
          var _user = findName(user.username);
          $("#user-list").append(createCellHeaderTable(_user.username.replace(/\./g, '_'), _user.name));
        });

        data.list_problems_solved.map(function (problem) {
          $("#problems-list").append(createRowProblem(problem));
          
          data.users.map(function(user){
            const id = 'general-' + problem.alias + '-' + user.username.replace(/\./g, '_');
            $('#general-' + problem.alias).append('<td id="'+ id +'"></td>');
          });
        });


        data.users.map(function(user){
          user.data.problems.map(function (problem) {
            const id = 'general-' + problem.alias + '-' + user.username.replace(/\./g, '_');
            $("#" + id).addClass("table-success");

            var counting = parseInt($('#general-' + problem.alias +'-nsolved').html()) + 1;
            $('#general-' + problem.alias +'-nsolved').html(counting)
          });
        });

        data.users.sort(function (a, b) {
          return (b.data.problems.length - a.data.problems.length);
        });




        var maxProblems = Math.max(...data.users.map(x=>x.data.problems.length));
        var minProblems = Math.min(...data.users.map(x=>x.data.problems.length));

        var diff = 1.0 * (maxProblems - minProblems) / COLORS.length;

        var position = 1;
        data.users.map(function (user) {
          var _user = findName(user.username);
          var colorPos = getColor(minProblems, diff, user.data.problems.length);
          var row = ['<tr>',
                      '<td>', position,'</td>',
                      '<td><strong>',
                        '<a href="https://omegaup.com/profile/',
                           _user.username +'" style="color:'+ COLORS[ colorPos ]+' !important;">',
                           _user.name, '</a>',
                      '</strong></td>',
                      '<td><strong>', user.data.problems.length,'</strong></td>',
                     '</tr>'];
          $("#table-standings-body").append(row.join(''));
          position =  position + 1;
        });
      }
    });
  }
});