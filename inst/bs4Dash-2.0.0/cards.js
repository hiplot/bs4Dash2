// Input binding
var cardBinding = new Shiny.InputBinding();

$.extend(cardBinding, {
  
  find: function(scope) {
    return $(scope).find(".card");
  },
  
  // Given the DOM element for the input, return the value
  getValue: function(el) {
    var config = $(el).parent().find("script[data-for='" + el.id + "']");
      config = JSON.parse(config.html());
      
      var isCollapsed = $(el).hasClass('collapsed-card');
      var display = $(el).css('display');
      var isMaximized = $(el).hasClass('maximized-card');
    
      var visible;
      if (display === "none") {
        visible = false;
      } else {
        visible = true;
      }
      
      // toggle collapse button when maximized
      if (config.maximized) {
        $(el).find("[data-card-widget = 'collapse']").hide();
      } else {
        $(el).find("[data-card-widget = 'collapse']").show();
      }
      
      return {
        collapsible: config.collapsible,
        collapsed: isCollapsed, 
        closable: config.closable,
        maximized: isMaximized,
        visible: visible, 
        status: config.status,
        solidHeader : config.solidHeader,
        background: config.background,
        width: config.width,
        height: config.height
      }; // this will be a list in R
  },
  _updateWidth: function(el, o, n) {
    $(el).parent().toggleClass("col-sm-" + o);
    $(el).parent().addClass("col-sm-" + n); 
    // trigger resize so that output resize
    $(el).trigger('resize');
  },
    
  setValue: function(el, value) {
      
    var config = $(el).parent().find("script[data-for='" + el.id + "']");
    config = JSON.parse(config.html());
      
    if (value.action === "update") {
      // To remove status explicitly set status = NULL in updateBox
      if (value.options.hasOwnProperty("status")) {
        if (value.options.status !== config.status) {
          // don't touch if null
          if (config.status !== null) {
            $(el).toggleClass("card-" + config.status); 
          }
          if (value.options.status !== null) {
            $(el).addClass("card-" + value.options.status);
          }
          config.status = value.options.status;
        } 
      }
      if (value.options.hasOwnProperty("solidHeader")) {
        // only update if config an new value are different
        if (value.options.solidHeader !== config.solidHeader) {
          $(el).toggleClass("card-outline");
          config.solidHeader = value.options.solidHeader;
        }
      }
      // To remove background explicitly set background = NULL in updateBox
      if (value.options.hasOwnProperty("background")) {
        if (value.options.background !== config.background) {
          // don't touch if null
          if (config.background !== null) {
            // if gradient, the class has a gradient at the end!
            if (config.gradient) {
              $(el).toggleClass("bg-gradient-" + config.background );
            } else {
              $(el).toggleClass("bg-" + config.background);
            }
          }
          if (value.options.background !== null) {
            if (config.gradient) {
              $(el).addClass("bg-" + value.options.background + "-gradient"); 
            } else {
              $(el).addClass("bg-" + value.options.background); 
            }
          }
          config.background = value.options.background; 
        } 
      }
      if (value.options.hasOwnProperty("width")) {
        if (value.options.width !== config.width) {
          this._updateWidth(el, config.width, value.options.width);
          config.width = value.options.width;
        }
      }
      if (value.options.hasOwnProperty("height")) {
        if (value.options.height !== config.height) {
          if (value.options.height === null) {
            $(el).find(".card-body").css("height", '');
          } else {
            $(el).find(".card-body").css("height", value.options.height);
          }
          
          config.height = value.options.height;
          // don't need to trigger resize since the output height
          // is not controlled by the box size ...
        }
      }
      if (value.options.hasOwnProperty("collapsible")) {
        if (value.options.collapsible !== config.collapsible) {
          if (!value.options.collapsible) {
            $(el).find('[data-card-widget = "collapse"]').remove();
            config.collapsible = false;
          } else {
            // only add if no collapsible
            if ($(el).find('[data-card-widget = "collapse"]').length === 0) {
              $(el)
                .find(".card-tools.pull-right")
                .prepend($('<button class="btn btn-tool" data-card-widget="collapse"><i class="fa fa-minus"></i></button>'));
              config.collapsible = true;
            }
          }
        }
      }
      if (value.options.hasOwnProperty("closable")) {
        if (value.options.closable !== config.closable) {
          if (!value.options.closable) {
            $(el).find('[data-card-widget = "remove"]').remove();
            config.closable = false;
          } else {
            if ($(el).find('[data-card-widget = "remove"]').length === 0) {
              $(el)
                .find(".card-tools.pull-right")
                .append($('<button class="btn btn-tool" data-card-widget="remove"><i class="fa fa-times"></i></button>'));
              config.closable = true;
            }
          }
        }
      }
      
      if (value.options.hasOwnProperty("maximizable")) {
        if (value.options.maximizable !== config.maximizable) {
          if (!value.options.maximizable) {
            $(el).find('[data-card-widget = "maximize"]').remove();
            config.maximizable = false;
          } else {
            if ($(el).find('[data-card-widget = "maximize"]').length === 0) {
              $(el)
                .find(".card-tools.pull-right")
                .append($('<button class="btn btn-tool" data-card-widget="maximize"><i class="fa fa-expand"></i></button>'));
              config.maximizable = true;
            }
          }
        }
      }
      
      // handle HTML tags (harder)
      if (value.options.hasOwnProperty("title")) {
        if (value.options.title !== config.title) {
          var newTitle = $.parseHTML(value.options.title);
          $(newTitle).addClass("card-title");
          $(el).find("h3").replaceWith($(newTitle));
        }
      }
      
      // replace the old JSON config by the new one to update the input value 
      $(el).parent().find("script[data-for='" + el.id + "']").replaceWith(
        '<script type="application/json" data-for="' + el.id + '">' + JSON.stringify(config) + '</script>'
      );
    } else {
      if (value != "restore") {
        if ($(el).css('display') != 'none') {
          $(el).CardWidget(value);  
        }
      } else {
        $(el).show();
        // this is needed so that the last event handler is considered
        // in the subscribe method. 
        $(el).trigger("shown");
      }
    }
  },
  receiveMessage: function(el, data) {
    this.setValue(el, data);
    $(el).trigger('change');
  },
  
  subscribe: function(el, callback) {
    $(el).on('expanded.lte.cardwidget collapsed.lte.cardwidget', function(e) {
      // set a delay so that SHiny get the input value when the collapse animation
      // is finished. 
      setTimeout(
        function() {
          callback();
        }, 500);
    });
    
    $(el).on('maximized.lte.cardwidget minimized.lte.cardwidget', function(e) {
      callback();
    });
    
    $(el).on('removed.lte.cardwidget', function(e) {
      setTimeout(
        function() {
          callback();
        }, 500);
    });
    // we need to split removed and shown event since shown is immediate whereas close
    // takes some time
    $(el).on('shown.cardBinding', function(e) {
      callback();
    });
    
    // handle change event triggered in the setValue method 
    $(el).on('change.cardBinding', function(event) {
      setTimeout(function() {
        callback();
      }, 500);
    });
  },
  
  unsubscribe: function(el) {
    $(el).off(".cardBinding");
  }
});

Shiny.inputBindings.register(cardBinding);



// Card sidebar input binding
var cardSidebarBinding = new Shiny.InputBinding();
$.extend(cardSidebarBinding, {
  
  find: function(scope) {
    return $(scope).find('[data-widget="chat-pane-toggle"]');
  },
  
  // Given the DOM element for the input, return the value
  getValue: function(el) {
    var cardWrapper = $(el).closest(".card");
    return $(cardWrapper).hasClass("direct-chat-contacts-open");
  },
  
  // see updatebs4Card
  receiveMessage: function(el, data) {
    // In theory, adminLTE3 has a builtin function
    // we could use $(el).DirectChat('toggle');
    // However, it does not update the related input.
    // The toggled.lte.directchat event seems to be broken.
    $(el).trigger('click');
    $(el).trigger("shown");
  },
  
  subscribe: function(el, callback) {
    $(el).on('click', function(e) {
      // set a delay so that Shiny get the input value when the collapse animation
      // is finished. 
      setTimeout(
        function() {
          callback();
        }, 10);
    });
  },
  
  unsubscribe: function(el) {
    $(el).off(".cardSidebarBinding");
  }
});

Shiny.inputBindings.register(cardSidebarBinding);
