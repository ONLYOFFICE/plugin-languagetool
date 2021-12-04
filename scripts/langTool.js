/**
 *
 * (c) Copyright Ascensio System SIA 2020
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
var Ps;
var PsTextArea;
const isIE = checkInternetExplorer();	//check IE
function checkInternetExplorer(){
    var rv = -1;
    if (window.navigator.appName == 'Microsoft Internet Explorer') {
        const ua = window.navigator.userAgent;
        const re = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');
        if (re.exec(ua) != null) {
            rv = parseFloat(RegExp.$1);
        }
    } else if (window.navigator.appName == 'Netscape') {
        const ua = window.navigator.userAgent;
        const re = new RegExp('Trident/.*rv:([0-9]{1,}[\.0-9]{0,})');

        if (re.exec(ua) != null) {
            rv = parseFloat(RegExp.$1);
        }
    }
    return rv !== -1;
};
(function(window, undefined){
	window.oncontextmenu = function(e)
	{
		if (e.preventDefault)
			e.preventDefault();
		if (e.stopPropagation)
			e.stopPropagation();
		return false;
	};
	var isInit = false;
	var CurLang = "auto";
	var txt = "";
	var matches;
	var displayNoneClass = "display-none";
	var blurClass        = "no_class";
    var elements         = null;
    var serviceUrl       = "https://languagetool.org/api/v2/check";
    var paste_done       = true;
	function showLoader(elements, show) {

       switchClass(elements.contentHolder, blurClass, show);
       switchClass(elements.loader, displayNoneClass, !show);
    };
    function getMessage(key) {
        return window.Asc.plugin.tr(key.trim());
    };
	function switchClass(el, className, add) {
        if (add) {
            el.classList.add(className);
        } else {
            el.classList.remove(className);
        }
    };


	window.Asc.plugin.init = function(text)	{
		txt = text;
		document.getElementById("textarea").innerText = text;
		updateScroll();
		$("#result").empty();
		if (!isInit) {
			init();
			isInit = true;
		}
	};
    window.Asc.plugin.onThemeChanged = function(theme)
    {
        window.Asc.plugin.onThemeChangedBase(theme);
        var rule = '.arrow { border-color : ' + window.Asc.plugin.theme["text-normal"] + ';}\n'
        if (theme.type == 'dark') {
            rule += '.asc-plugin-loader .asc-loader-image { background-image : url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyOCAyOCI+PGNpcmNsZSBjeD0iMTQiIGN5PSIxNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjEuNSIgcj0iMTAuMjUiIHN0cm9rZS1kYXNoYXJyYXk9IjE2MCUsIDQwJSIgLz48L3N2Zz4=) !important;}\n';
        }
        else if (theme.type == 'light') {
            rule += '.asc-plugin-loader .asc-loader-image { background-image : url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAyMCI+PGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNDQ0IiBzdHJva2Utd2lkdGg9IjEuNSIgcj0iNy4yNSIgc3Ryb2tlLWRhc2hhcnJheT0iMTYwJSwgNDAlIiAvPjwvc3ZnPg==) !important;}\n';
        }
        rule += ".select2-container--default.select2-container--open .select2-selection__arrow b { border-color : " + window.Asc.plugin.theme["text-normal"] + " !important; }";

        var styleTheme = document.createElement('style');
        styleTheme.type = 'text/css';
        styleTheme.innerHTML = rule;
        document.getElementsByTagName('head')[0].appendChild(styleTheme);
        $('.asc-loader-title').css('color', window.Asc.plugin.theme["text-normal"]);
        $('.result_div').css('background', window.Asc.plugin.theme["background-normal"]);

        if (!isIE) {
            $('#enter_container').css('background-color', window.Asc.plugin.theme["background-normal"]);
            $('.asc-loader-title').css('color', window.Asc.plugin.theme["text-normal"]);
            $('#show_manually, #hide_manually').css('border-bottom', '1px dashed ' + window.Asc.plugin.theme["text-normal"]);
            $('#arrow-svg-path').css('fill', theme["text-normal"]);
        }
        else
            $('#enter_container').css('background-color', window.Asc.plugin.theme["RulerLight"]);
    };
	$(document).ready(function () {
	    elements = {
            loader: document.getElementById("loader-container"),
            contentHolder: document.getElementById("result"),
		};
        PsTextArea = new PerfectScrollbar("#enter_container", { suppressScrollX  : true});

		$('#check').on('click', function(){
			txt = document.getElementById("textarea").innerText.trim();
			if (txt !== "") {
				$("#result").empty();
				checkText(txt, CurLang);
			};
		});
		$('#replace').click(function () {
		    if (!paste_done)
		        return;
		    else
		        paste_done = false;

            Asc.scope.arr = ParseText(document.getElementById("textarea").innerText);
            window.Asc.plugin.info.recalculate = true;

            // for usual paste
            var strResult = "";
            for (var Item = 0; Item < Asc.scope.arr.length; Item++) {
                if (Asc.scope.arr[Item] === "")
                    continue;
                if (Item < Asc.scope.arr.length - 1)
                    strResult += Asc.scope.arr[Item] + '\n';
                else
                    strResult += Asc.scope.arr[Item];
            }

            window.Asc.plugin.executeMethod("GetVersion", [], function(version) {
                if (version === undefined) {
                   window.Asc.plugin.executeMethod("PasteText", [strResult], function(result) {
                        paste_done = true;
                   });
                }
                else {
                    window.Asc.plugin.executeMethod("GetSelectionType", [], function(sType) {
                        switch (sType) {
                            case "none":
                            case "drawing":
                                window.Asc.plugin.executeMethod("PasteText", [strResult], function(result) {
                                    paste_done = true;
                                });
                                break;
                            case "text":
                                window.Asc.plugin.callCommand(function() {
                                    Api.ReplaceTextSmart(Asc.scope.arr);
                                }, undefined, undefined, function(result) {
                                    paste_done = true;
                                });
                                break;
                        }
                    });
                }
            });
        });
        $('#textarea').keyup(function(e) {
            updateScroll();
        });
        $("#enter_container").click(function() {
            $("#textarea").focus();
        });
	});


    function ParseText(sText) {
        var allParasInSelection = sText.split(/\n/);
        var allParsedParas = [];

        for (var nStr = 0; nStr < allParasInSelection.length; nStr++) {
            if (allParasInSelection[nStr].search(/	/) === 0) {
                allParsedParas.push("");
                allParasInSelection[nStr] = allParasInSelection[nStr].replace(/	/, "");
            }
            var sSplited = allParasInSelection[nStr].split(/	/);

            sSplited.forEach(function(item, i, sSplited) {
                allParsedParas.push(item);
            });
        }

        return allParsedParas;
    };

	function getLanguages() {
		var url = "https://languagetool.org/api/v2/languages";
		return $.ajax({
			method: 'GET',
			url: url
		});
	};

	function checkText(txt, lang) {
	    updateScroll();
	    showLoader(elements, true);
		var data = {
			text : txt,
			language : lang,
			enabledOnly : false
		}

		$.ajax({
			method: 'POST',
			beforeSend: function(request) {
				request.setRequestHeader("Content-Type", 'application/x-www-form-urlencoded');
			},
			data : data,
			url: serviceUrl
		}).success(function (oResponse) {
			matches = oResponse.matches.map(function(el, ind) {
				el.index = ind;
				return el;
			});
			parseResult(oResponse);
			if (window.Asc.plugin.theme)
			    $('.result_div').css('background', window.Asc.plugin.theme["background-normal"]);
			showLoader(elements, false);
		}).error(function(e){
		    $('<span>', {
		        "class": "error",
		        text: e.responseText
		    }).appendTo('#result');
			console.log(e);
			showLoader(elements, false);
		});
	};

	function parseResult (oResponse) {
        $('#result').empty();
		var data = oResponse.matches.map(function (el) {
			return {
				shortMessage : el.shortMessage,
				message : el.message,
				replacements : el.replacements,
				context : el.context
			}
		});

        if (data.length === 0) {
            $('<div>', {
                id: "no_mistakes",
                text: "No possible mistakes found"
            }).appendTo('#result');
        }
        else {
            $('<div>', {
                id: "yes_mistakes",
                text: "Possible mistakes found: " + data.length
            }).appendTo('#result');
        }

		data.forEach(function(el, ind) {
//		    if (el.replacements.length === 0) {
//		        var countMistakes = Number($('#yes_mistakes').text().split(' ')[3]);
//			    $('#yes_mistakes').text("Possible mistakes found: " + String(countMistakes - 1));
//			    return;
//		    }

			$('<div>', {
				id : "div_" + ind,
				"class": 'result_div',
				click: function() {
				        var mainElm = this;
                        $(this).find(".details").slideToggle("fast", function() {
                            updateScroll();
                            $(mainElm).find(".separator").toggleClass("display-none");
                        });
                        $(this).find(".arrow").toggleClass("down");
                        $(this).find(".arrow").toggleClass("up");
                    }
			}).appendTo('#result');

			var img_arrow = $('<i>', {
                "class": "arrow down",
            });
            var img_container = $('<div>', {
                "class": "arrow_container"
            });
            var caption_text = $('<span>', {
				"class": 'caption_text',
				text : el.message
			});
            var caption = $('<div>', {
				"class": 'caption',
			});
            var separateLine = $('<div>', {
				"class": 'separator horizontal display-none',
			});
            var context = $('<div>', {
                           html : el.context.text.slice(0, el.context.offset)
            		           + '<span style="color:red; font-weight: bold;">'
            		           + el.context.text.slice(el.context.offset,el.context.offset + el.context.length)
            		           + '</span>'
            		           + el.context.text.slice(el.context.offset + el.context.length)
            		 });
            context.appendTo('#div_'+ind);
            img_arrow.appendTo(img_container);
            caption_text.appendTo(caption);
            img_container.appendTo(caption);
            caption.appendTo('#div_'+ind);
            separateLine.appendTo('#div_'+ind);

            var div_details = $('<div>', {
				"class": 'details'
			});

			$('<div>', {
				id : "div_replacments_" + ind,
				"class": 'replacments',
			}).appendTo(div_details);

			div_details.appendTo('#div_'+ind);

			el.replacements.forEach(function(elem) {
			    var sClass = '';
			    if (elem.value === ' ')
			        sClass = ' replacment_space';
				$('<button>', {
					"class": 'replacment btn-text-default' + sClass,
					text: elem.value,
					click : function () {
						var countMistakes = Number($('#yes_mistakes').text().split(' ')[3]);
			            $('#yes_mistakes').text("Possible mistakes found: " + String(countMistakes - 1));
						correctText($(this));
					}
				}).data({ index : ind })
				.appendTo('#div_replacments_'+ind);
			});

			var dismiss_buttons = $('<div>', {
			    "class": "dismiss_buttons"
			});

			$('<button>', {
			    text: "Dismiss",
			    click: function () {
					$('#div_'+$(this).data().index).remove();
					var ind = matches.findIndex(function(el) {
						if (el.index === ind) {
							return true;
						}
					});
					var countMistakes = Number($('#yes_mistakes').text().split(' ')[3]);
					$('#yes_mistakes').text("Possible mistakes found: " + String(countMistakes - 1));
					matches.splice(ind, 1);
				},
			    "class": "dismiss btn-text-default"
			}).data({ index : ind }).appendTo(dismiss_buttons);

			$('<button>', {
			    text: "Dismiss all",
			    click: function () {
					$('.dismiss').each(function() {
					     $(this).trigger("click");
					});
				},
			    "class": "dismiss_all btn-text-default"
			}).appendTo(dismiss_buttons);
			dismiss_buttons.appendTo(div_details);
		});
		updateScroll();
	};

	function correctText(data) {
	    if (data.text()[0] === '(' && data.text()[data.text().length - 1] === ')') {
	        return data.parent().parent().find('.dismiss').trigger("click");
	    }

		var ind = data.data().index;
		ind = matches.findIndex(function(el) {
			if (el.index === ind) {
				return true;
			}
		});
		var end = matches[ind].offset + matches[ind].length;
		var temp = txt.slice(0, matches[ind].offset) + data.text() + txt.slice(end);
		var count = txt.length - temp.length;
		matches.splice(ind, 1);
		txt = temp;
		document.getElementById("textarea").innerText = txt;
		for (var i = ind; i < matches.length; i++) {
			matches[i].offset -= count;
		}
		$('#div_'+data.data().index).remove();
		if (!matches.length) {
			$('#check').trigger("click");
		}
		updateScroll();
	};

	function init() {
		getLanguages().then(function(oResponse) {
			var languages = oResponse.map(function(el, ind) {
				return {
					id : ind + 1,
					text : el.name,
					code : el.code,
					longcode : el.longCode
				};
			});
			languages.unshift({id : 0, text:"Auto", code : "auto", longcode : "auto"});
			$('#language_id').select2({
				data : languages
			}).on('select2:select', function (e) {
				CurLang = e.params.data.longcode;
				// console.log(e.params.data);
			});
		}, function(err) {console.log("ouch" +err)});

		var container = document.getElementById('scrollable-container-id');			
        Ps = new PerfectScrollbar('#' + container.id, { minScrollbarLength: 20 });
			// updateScroll();
			// updateScroll();
	};
	
	window.Asc.plugin.button = function(id)
	{
		this.executeCommand("close", "");
	};
	
	window.onresize = function() {
		updateScroll();
		updateScroll();
	};

	window.Asc.plugin.onExternalMouseUp = function() {
		var evt = document.createEvent("MouseEvents");
		evt.initMouseEvent("mouseup", true, true, window, 1, 0, 0, 0, 0,
			false, false, false, false, 0, null);

		document.dispatchEvent(evt);
	};
	
	function updateScroll()
	{
		Ps && Ps.update();
		PsTextArea && PsTextArea.update();
	};

	window.Asc.plugin.onTranslate = function()
	{
        var elements = document.getElementsByClassName("i18n");

        for (var i = 0; i < elements.length; i++) {
            var el = elements[i];
            if (el.attributes["placeholder"]) el.attributes["placeholder"].value = getMessage(el.attributes["placeholder"].value);
            if (el.innerText) el.innerText = getMessage(el.innerText);
        }
    };
		  
})(window, undefined);
