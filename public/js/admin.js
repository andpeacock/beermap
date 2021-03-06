$(function() {
  var admin= {
    init: function() {
      var self= this;
      self.binding();
    },
    binding: function() {
      $('#postLogin').on('click', function() {
        $.post('/users/login', {username: $('#username').val(), password: $('#password').val()}, function(data) {
          console.log(data);
          console.log("posted");
        });
      });
      $('#forceSync').on('click', function() {//Sync beer list
        var t= $(this);
        t.button('loading');
        $.get('/admin/forceUpdate', function(data) {
          t.button('reset');
          console.log(data);
        });
      });
      $('#addBrew').on('click', function() {//Add brewery function
        $(this).button('loading');
        var postObj= {
          name: $('#brewName').val(),
          utvid: $('#brewVid').val(),
          address: $('#brewAddr').val(),
          phone: $('#brewTel').val(),
          url: $('#brewUrl').val(),
          lat: $('#brewLat').val(),
          lng: $('#brewLng').val()
        };
        $.post('/admin/addBrew', postObj, function(data) {
          $('#addBrew').button('reset');
          $('#addBrewForm input').val('');
        });
      });
      $('.brewEditBtn').on('click', function() {//Add other buttons
        $(this).parent().find('span').each(function() {
          $(this).parent().append('<input type="text" class="form-control" placeholder="'+$(this).text()+'" />');
          $(this).remove();
        });
        $(this).parent().append('<div role="group" class="btn-group editGroup">'+
          '<button type="button" class="btn btn-warning editCancel">Cancel changes</button>'+
          '<button type="button" class="btn btn-danger editDelete" data-loading-text="Deleting...">Delete entry</button>'+
          '<button type="button" class="btn btn-primary editUtvid" data-loading-text="Changing...">Change utvid</button>'+
          '<button type="button" class="btn btn-success editUpdate" data-loading-text="Updating...">Update</button></div>');
        $(this).hide();
      });
      $('#brewEdit').on('click', '.editCancel', function() {//Cancel edit button
        $(this).parent().parent().find('input').not('.nameinp').each(function() {
          $(this).parent().append('<span class="editTextHold">'+$(this).attr('placeholder')+'</span>');
          $(this).remove();
        });
        $(this).parent().siblings('.brewEditBtn').show();
        $(this).parent().remove();
      });
      $('#brewEdit').on('click', '.editDelete', function() {//Delete entry button
        var utvid= $(this).parent().siblings('p.utvid').data('utvid');
        var t= $(this);
        if(confirm("Are you sure?")) {
          t.button('loading');
          $.get('/admin/deleteBrew', function(data) {
            t.button('reset');
            console.log("deleted");
          });
        }
      });
      $('#brewEdit').on('click', '.editUtvid', function() {//Edit Utvid button
        var t= $(this);
        t.button('loading');
        $.post('/admin/updateUtvid', {oldutvid: $('.utvid').data('utvid'), newutvid: $('.utvid').find('input').val()}, function(data) {
          console.log(data);
          t.button('reset');
        });
      });
      $('#brewEdit').on('click', '.editUpdate', function() {//Update button
        var t= $(this);
        var updObj= {
          name: null,
          utvid: $(this).parent().siblings('p.utvid').data('utvid'),
          address: null,
          phone: null,
          url: null,
          lat: null,
          lng: null
        };
        $(this).parent().parent().find('input').each(function() {
          if($(this).val())
            updObj[$(this).parent().attr('class')]= $(this).val();
        });
        for(var key in updObj) {
          if(updObj[key]=== null)
            delete updObj[key];
        }
        t.button('loading');
        $.post('/admin/updateBrew', updObj, function(data) {
          t.button('reset');
          $(this).parent().siblings('.brewEditBtn').show();
          $(this).parent().remove();
        });
      });
    }
  };
  admin.init();
});