/*
 * Symphony - A modern community (forum/BBS/SNS/blog) platform written in Java.
 * Copyright (C) 2012-2018, b3log.org & hacpai.com
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
/**
 * @fileoverview \u804a\u5929\u5ba4
 *
 * @author <a href="http://vanessa.b3log.org">Liyuan Li</a>
 * @version 1.2.2.3, Apr 25, 2017
 */

/**
 * @description Add comment function.
 * @static
 */
var ChatRoom = {
    init: function () {
        // \u804a\u5929\u7a97\u53e3\u9ad8\u5ea6\u8bbe\u7f6e
        if ($.ua.device.type !== 'mobile') {
            $('.list').height($('.side').height() - $('.chat-room .module:first').outerHeight() - 20);
        } else {
            $('.list').height($(window).height() - 173);
        }

        // \u6ca1\u7528\u767b\u9646\u5c31\u4e0d\u9700\u8981\u7f16\u8f91\u8d77\u521d\u59cb\u5316\u4e86 
        if ($('#chatContent').length === 0) {
            return false;
        }

        if ($.ua.device.type === 'mobile' && ($.ua.device.vendor === 'Apple' || $.ua.device.vendor === 'Nokia')) {
            // editor \u4e0d\u652f\u6301\u65f6\uff0c\u4f7f\u7528 textarea
            $('#chatContent').before('<form id="fileUpload" method="POST" enctype="multipart/form-data"><label class="btn">'
                    + Label.uploadLabel + '<input type="file"/></label></form>')
                    .css('margin', 0);
            ChatRoom.editor = Util.initTextarea('chatContent',
                    function (editor) {
                        if (window.localStorage) {
                            window.localStorage.chatRoom = editor.$it.val();
                        }
                    }
            );
        } else {
            Util.initCodeMirror();

            var commentEditor = new Editor({
                element: document.getElementById('chatContent'),
                dragDrop: false,
                lineWrapping: true,
                toolbar: [
                    {name: 'emoji'},
                    {name: 'bold'},
                    {name: 'italic'},
                    {name: 'quote'},
                    {name: 'link'},
                    {name: 'image', html: '<div class="tooltipped tooltipped-n" aria-label="' + Label.uploadFileLabel + '" ><form id="fileUpload" method="POST" enctype="multipart/form-data"><label class="icon-upload"><svg><use xlink:href="#upload"></use></svg><input type="file"/></label></form></div>'},
                    {name: 'unordered-list'},
                    {name: 'ordered-list'},
                    {name: 'view'},
                    {name: 'fullscreen'},
                    {name: 'question', action: 'https://hacpai.com/guide/markdown'}
                ],
                extraKeys: {
                    "Alt-/": "autocompleteUserName",
                    "Cmd-/": "autocompleteEmoji",
                    "Ctrl-/": "autocompleteEmoji",
                    "Alt-S": "startAudioRecord",
                    "Alt-R": "endAudioRecord"
                },
                status: false
            });
            commentEditor.render();
            ChatRoom.editor = commentEditor.codemirror;
        }

        // \u9875\u9762\u5237\u65b0\u9700\u8981\u4fdd\u5b58\u8f93\u5165\u6846\u5185\u5bb9
        if (window.localStorage && window.localStorage.chatRoom) {
            if ("" !== window.localStorage.chatRoom.replace(/(^\s*)|(\s*$)/g, "")) {
                ChatRoom.editor.setValue(window.localStorage.chatRoom);
            }
        }

        if ($.ua.device.type === 'mobile' && ($.ua.device.vendor === 'Apple' || $.ua.device.vendor === 'Nokia')) {
            return false;
        }

        // at \u53ca\u672c\u5730\u4fdd\u5b58\u8f93\u5165\u6846\u5185\u5bb9
        ChatRoom.editor.on('changes', function (cm) {
            $("#chatContentTip").removeClass("error succ").html('');

            if (window.localStorage) {
                window.localStorage.chatRoom = cm.getValue();
            }

            var cursor = cm.getCursor();
            var token = cm.getTokenAt(cursor);
            if (token.string.indexOf('@') === 0) {
                cm.showHint({hint: CodeMirror.hint.userName, completeSingle: false});
                return CodeMirror.Pass;
            }
        });

        // ctrl \uff0b enter \u5feb\u901f\u63d0\u4ea4
        ChatRoom.editor.on('keypress', function (cm, evt) {
            if (evt.ctrlKey && 10 === evt.charCode) {
                ChatRoom.send();
                return;
            }
        });

        ChatRoom.editor.on('keydown', function (cm, evt) {
            if ($.ua.os.name.indexOf('Mac OS') > -1 && evt.metaKey && evt.keyCode === 13) {
                ChatRoom.send();
            }
            if (8 === evt.keyCode) {
                var cursor = cm.getCursor();
                var token = cm.getTokenAt(cursor);

                // delete the whole emoji
                var preCursor = CodeMirror.Pos(cursor.line, cursor.ch);
                token = cm.getTokenAt(preCursor);
                if (/^:\S+:$/.test(token.string)) {
                    cm.replaceRange("", CodeMirror.Pos(cursor.line, token.start),
                            CodeMirror.Pos(cursor.line, token.end - 1));
                }
            }
        });
    },
    /**
     * \u53d1\u9001\u804a\u5929\u5185\u5bb9
     * @returns {undefined}
     */
    send: function () {
        var content = ChatRoom.editor.getValue();
        var requestJSONObject = {
            content: content
        };

        $.ajax({
            url: Label.servePath + "/chat-room/send",
            type: "POST",
            cache: false,
            data: JSON.stringify(requestJSONObject),
            beforeSend: function () {
                $(".form button.red").attr("disabled", "disabled").css("opacity", "0.3");
                ChatRoom.editor.setOption("readOnly", "nocursor");
            },
            success: function (result, textStatus) {
                if (result.sc) {
                    $("#chatContentTip").removeClass("error succ").html('');

                    ChatRoom.editor.setValue('');
                    // reset comment editor
                    $('.editor-preview').html('');
                    if ($('.icon-view').parent().hasClass('active')) {
                        $('.icon-view').click();
                    }

                    if (window.localStorage) {
                        window.localStorage.chatRoom = '';
                    }
                } else {
                    $("#chatContentTip").addClass("error").html('<ul><li>' + result.msg + '</li></ul>');
                }
            },
            error: function (result) {
                $("#chatContentTip").addClass("error").html('<ul><li>' + result.statusText + '</li></ul>');
            },
            complete: function (jqXHR, textStatus) {
                $(".form button.red").removeAttr("disabled").css("opacity", "1");
                ChatRoom.editor.setOption("readOnly", false);
            }
        });
    }
};

