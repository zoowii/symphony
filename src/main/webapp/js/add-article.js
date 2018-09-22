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
 * @fileoverview add-article.
 *
 * @author <a href="http://vanessa.b3log.org">Liyuan Li</a>
 * @author <a href="http://88250.b3log.org">Liang Ding</a>
 * @author <a href="http://zephyr.b3log.org">Zephyr</a>
 * @version 2.25.0.0, Aug 10, 2018
 */

/**
 * @description Add article function.
 * @static
 */
var AddArticle = {
  editor: undefined,
  rewardEditor: undefined,
  /**
   * @description \u5220\u9664\u6587\u7ae0
   * @csrfToken [string] CSRF \u4ee4\u724c
   * @it [bom] \u8c03\u7528\u4e8b\u4ef6\u7684\u5143\u7d20
   */
  remove: function (csrfToken, it) {
    if (!confirm(Label.confirmRemoveLabel)) {
      return
    }

    $.ajax({
      url: Label.servePath + '/article/' + Label.articleOId + '/remove',
      type: 'POST',
      headers: {'csrfToken': csrfToken},
      cache: false,
      beforeSend: function () {
        $(it).attr('disabled', 'disabled').css('opacity', '0.3')
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $('#addArticleTip').
          addClass('error').
          html('<ul><li>' + errorThrown + '</li></ul>')
      },
      success: function (result, textStatus) {
        $(it).removeAttr('disabled').css('opacity', '1')
        if (0 === result.sc) {
          window.location.href = Label.servePath + '/member/' + Label.userName
        } else {
          $('#addArticleTip').
            addClass('error').
            html('<ul><li>' + result.msg + '</li></ul>')
        }
      },
      complete: function () {
        $(it).removeAttr('disabled').css('opacity', '1')
      },
    })
  },
  /**
   * @description \u53d1\u5e03\u6587\u7ae0
   * @csrfToken [string] CSRF \u4ee4\u724c
   * @it [Bom] \u89e6\u53d1\u4e8b\u4ef6\u7684\u5143\u7d20
   */
  add: function (csrfToken, it) {
    if (Validate.goValidate({
      target: $('#addArticleTip'),
      data: [
        {
          'type': 'string',
          'max': 256,
          'msg': Label.articleTitleErrorLabel,
          'target': $('#articleTitle'),
        }, {
          'type': 'editor',
          'target': this.editor,
          'max': 1048576,
          'min': 4,
          'msg': Label.articleContentErrorLabel,
        }],
    })) {
      var articleType = parseInt(
        $('input[type=\'radio\'][name=\'articleType\']:checked').val())

      if (articleType !== 5) {
        // \u6253\u8d4f\u533a\u542f\u7528\u540e\u79ef\u5206\u4e0d\u80fd\u4e3a\u7a7a
        if ($('#articleRewardPoint').data('orval')
          && !/^\+?[1-9][0-9]*$/.test($('#articleRewardPoint').val())) {
          $('#addArticleTip').addClass('error').html('<ul><li>'
            + Label.articleRewardPointErrorLabel + '</li></ul>')
          return false
        }
      }

      var articleTags = ''
      $('.tags-input .tag .text').each(function () {
        articleTags += $(this).text() + ','
      })

      var requestJSONObject = {
        articleTitle: $('#articleTitle').val().replace(/(^\s*)|(\s*$)/g, ''),
        articleContent: this.editor.getValue(),
        articleTags: articleTags,
        articleCommentable: $('#articleCommentable').prop('checked'),
        articleType: articleType,
      }

      if (articleType !== 5) {
        requestJSONObject.articleRewardContent = this.rewardEditor.getValue()
        requestJSONObject.articleRewardPoint = $('#articleRewardPoint').
          val().
          replace(/(^\s*)|(\s*$)/g, '')
        requestJSONObject.articleAnonymous = $('#articleAnonymous').
          prop('checked')
      } else {
        requestJSONObject.articleQnAOfferPoint = $('#articleAskPoint').
          val().
          replace(/(^\s*)|(\s*$)/g, '')
      }

      var url = Label.servePath + '/article', type = 'POST'

      if (3 === parseInt(requestJSONObject.articleType)) { // \u5982\u679c\u662f\u201c\u601d\u7eea\u201d
        requestJSONObject.articleContent = JSON.parse(
          window.localStorage.postData).thoughtContent
      }

      if (Label.articleOId) {
        url = url + '/' + Label.articleOId
        type = 'PUT'
      }

      $.ajax({
        url: url,
        type: type,
        headers: {'csrfToken': csrfToken},
        cache: false,
        data: JSON.stringify(requestJSONObject),
        beforeSend: function () {
          $(it).attr('disabled', 'disabled').css('opacity', '0.3')
        },
        error: function (jqXHR, textStatus, errorThrown) {
          $('#addArticleTip').
            addClass('error').
            html('<ul><li>' + errorThrown + '</li></ul>')
        },
        success: function (result, textStatus) {
          $(it).removeAttr('disabled').css('opacity', '1')
          if (0 === result.sc) {
            window.location.href = Label.servePath + '/article/' +
              result.articleId
            localStorage.removeItem('postData')
          } else {
            $('#addArticleTip').
              addClass('error').
              html('<ul><li>' + result.msg + '</li></ul>')
          }
        },
        complete: function () {
          $(it).removeAttr('disabled').css('opacity', '1')
        },
      })
    }
  },
  /**
   * @description \u521d\u59cb\u5316\u53d1\u6587
   */
  init: function () {
    $.ua.set(navigator.userAgent)

    // local data
    if (location.search.indexOf('?id=') > -1) {
      localStorage.removeItem('postData')
    }

    var postData = undefined
    if (!localStorage.postData) {
      postData = {
        title: '',
        content: '',
        tags: '',
        thoughtContent: '',
        rewardContent: '',
        rewardPoint: '',
      }
      localStorage.postData = JSON.stringify(postData)
    } else {
      postData = JSON.parse(localStorage.postData)
    }

    // init content editor
    if ('' !== postData.content) {
      $('#articleContent').val(postData.content)
    }

    if ($.ua.device.type === 'mobile' &&
      ($.ua.device.vendor === 'Apple' || $.ua.device.vendor === 'Nokia')) {
      AddArticle.editor = Util.initTextarea('articleContent',
        function (editor) {
          var postData = JSON.parse(localStorage.postData)
          postData.content = editor.getValue()
          localStorage.postData = JSON.stringify(postData)
        }
      )
      $('#articleContent').
        before('<form id="fileUpload" method="POST" enctype="multipart/form-data"><label class="btn">'
          + Label.uploadLabel + '<input type="file"/></label></form>').
        css('margin-top', 0)
    } else {
      Util.initCodeMirror()
      // \u521d\u59cb\u5316\u6587\u7ae0\u7f16\u8f91\u5668
      var addArticleEditor = new Editor({
        element: document.getElementById('articleContent'),
        dragDrop: false,
        lineWrapping: true,
        htmlURL: Label.servePath + '/markdown',
        readOnly: Label.requisite,
        extraKeys: {
          'Alt-/': 'autocompleteUserName',
          'Ctrl-/': 'autocompleteEmoji',
          'Cmd-/': 'autocompleteEmoji',
          'Alt-S': 'startAudioRecord',
          'Alt-R': 'endAudioRecord',
        },
        toolbar: [
          {name: 'emoji'},
          {name: 'bold'},
          {name: 'italic'},
          {name: 'quote'},
          {name: 'link'},
          {
            name: 'image',
            html: '<div class="tooltipped tooltipped-n" aria-label="' +
            Label.uploadFileLabel +
            '" ><form id="fileUpload" method="POST" enctype="multipart/form-data"><label class="icon-upload"><svg><use xlink:href="#upload"></use></svg><input type="file"/></label></form></div>',
          },
          {name: 'unordered-list'},
          {name: 'ordered-list'},
          {name: 'view'},
          {name: 'fullscreen'},
          {name: 'question', action: 'https://hacpai.com/guide/markdown'},
        ],
        status: false,
      })
      addArticleEditor.render()

      AddArticle.editor = addArticleEditor.codemirror
    }

    // \u9ed8\u8ba4\u4f7f\u7528 preview
    $('.post-article-content .editor-toolbar .icon-view:eq(0)').
      parent().
      click()

    // \u79c1\u4fe1 at \u9ed8\u8ba4\u503c
    var atIdx = location.href.indexOf('at=')
    if (-1 !== atIdx) {
      if ('' == postData.content) {
        var at = AddArticle.editor.getValue()
        AddArticle.editor.setValue('\n\n\n' + at)
        AddArticle.editor.setCursor(CodeMirror.Pos(0, 0))
        AddArticle.editor.focus()
      }

      if ('' == postData.title) {
        var username = Util.getParameterByName('at')
        $('#articleTitle').val('Hi, ' + username)
      }

      if ('' !== postData.tags) {
        var tagTitles = Label.discussionLabel
        var tags = Util.getParameterByName('tags')
        if ('' !== tags) {
          tagTitles += ',' + tags
        }
        $('#articleTags').val(tagTitles)
      }
    }

    // set url title
    if ('' == postData.title) {
      var title = Util.getParameterByName('title')
      if (title && title.length > 0) {
        $('#articleTitle').val(title)
      }
    }

    // set localStorage
    if ('' !== postData.title) {
      $('#articleTitle').val(postData.title)
    }
    $('#articleTitle').keyup(function () {
      var postData = JSON.parse(localStorage.postData)
      postData.title = $(this).val()
      localStorage.postData = JSON.stringify(postData)
    })

    if ('' !== postData.tags) {
      $('#articleTags').val(postData.tags)
    }

    this._initTag()

    if ($.ua.device.type !== 'mobile' ||
      ($.ua.device.vendor !== 'Apple' && $.ua.device.vendor !== 'Nokia')) {
      AddArticle.editor.on('keydown', function (cm, evt) {
        if (8 === evt.keyCode) {
          var cursor = cm.getCursor()
          var token = cm.getTokenAt(cursor)

          // delete the whole emoji
          var preCursor = CodeMirror.Pos(cursor.line, cursor.ch)
          token = cm.getTokenAt(preCursor)
          if (/^:\S+:$/.test(token.string)) {
            cm.replaceRange('', CodeMirror.Pos(cursor.line, token.start),
              CodeMirror.Pos(cursor.line, token.end - 1))
          }
        }
      })

      var thoughtTime = ''
      AddArticle.editor.on('changes', function (cm, changes) {
        var postData = JSON.parse(localStorage.postData)
        postData.content = cm.getValue()

        if (thoughtTime === '') {
          thoughtTime = (new Date()).getTime()
        }

        var cursor = cm.getCursor()
        var token = cm.getTokenAt(cursor)
        if (token.string.indexOf('@') === 0) {
          cm.showHint({hint: CodeMirror.hint.userName, completeSingle: false})
          return CodeMirror.Pass
        }

        var change = '',
          unitSep = String.fromCharCode(31), // Unit Separator (\u5355\u5143\u5206\u9694\u7b26)
          time = (new Date()).getTime() - thoughtTime

        switch (changes[0].origin) {
          case '+delete':
            change = String.fromCharCode(24) + unitSep + time // cancel
              + unitSep + changes[0].from.ch + '-' + changes[0].from.line
              + unitSep + changes[0].to.ch + '-' + changes[0].to.line
              + String.fromCharCode(30)  // Record Separator (\u8bb0\u5f55\u5206\u9694\u7b26)
            break
          case '*compose':
          case '+input':
          default:

            for (var i = 0; i < changes[0].text.length; i++) {
              if (i === changes[0].text.length - 1) {
                change += changes[0].text[i]
              } else {
                change += changes[0].text[i] + String.fromCharCode(10) // New Line
              }
            }
            for (var j = 0; j < changes[0].removed.length; j++) {
              if (j === 0) {
                change += String.fromCharCode(29) // group separator
                break
              }
            }
            change += unitSep + time
              + unitSep + changes[0].from.ch + '-' + changes[0].from.line
              + unitSep + changes[0].to.ch + '-' + changes[0].to.line
              + String.fromCharCode(30)  // Record Separator (\u8bb0\u5f55\u5206\u9694\u7b26)
            break
        }

        postData.thoughtContent += change
        localStorage.postData = JSON.stringify(postData)

        if ($('.post-article-content .editor-preview-active').length === 0) {
          return false
        }

        $.ajax({
          url: Label.servePath + '/markdown',
          type: 'POST',
          cache: false,
          data: {
            markdownText: cm.getValue(),
          },
          success: function (result, textStatus) {
            $('.post-article-content .editor-preview-active').
              html(result.html)
            hljs.initHighlighting.called = false
            hljs.initHighlighting()
            Util.parseMarkdown()
          },
        })
      })
    }

    // focus
    if ($('#articleTitle').val().length <= 0) {
      $('#articleTitle').focus()
    }

    // check title is repeat
    $('#articleTitle').blur(function () {
      if ($.trim($(this).val()) === '') {
        return false
      }

      if (1 === Label.articleType) { // \u5c0f\u9ed1\u5c4b\u4e0d\u68c0\u67e5
        return
      }

      $.ajax({
        url: Label.servePath + '/article/check-title',
        type: 'POST',
        data: JSON.stringify({
          'articleTitle': $.trim($(this).val()),
          'articleId': Label.articleOId, // \u66f4\u65b0\u65f6\u624d\u6709\u503c
        }),
        success: function (result, textStatus) {
          if (!result.sc) {
            if ($('#articleTitleTip').length === 1) {
              $('#articleTitleTip').html(result.msg)
            } else {
              $('#articleTitle').
                after('<div class="module" id="articleTitleTip">' +
                  result.msg +
                  '</div>')
            }

          } else {
            $('#articleTitleTip').remove()
          }
        },
      })
    })

    // \u5feb\u6377\u53d1\u6587
    $('#articleTags, #articleRewardPoint, #articleAskPoint').keypress(function (event) {
      if (event.ctrlKey && 10 === event.charCode) {
        AddArticle.add()
        return false
      }
    })

    if ($('#articleAskPoint').length === 0) {
      // \u521d\u59cb\u5316\u6253\u8d4f\u533a\u7f16\u8f91\u5668
      if (0 < $('#articleRewardPoint').val().replace(/(^\s*)|(\s*$)/g, '')) {
        $('#showReward').click()
      }

      if ($.ua.device.type === 'mobile' &&
        ($.ua.device.vendor === 'Apple' || $.ua.device.vendor === 'Nokia')) {
        AddArticle.rewardEditor = Util.initTextarea('articleRewardContent',
          function (editor) {
            var postData = JSON.parse(localStorage.postData)
            postData.rewardContent = editor.getValue()
            localStorage.postData = JSON.stringify(postData)
          }
        )

        $('#articleRewardContent').
          before('<form id="rewardFileUpload" method="POST" enctype="multipart/form-data"><label class="btn">'
            + Label.uploadLabel + '<input type="file"/></label></form>').
          css('margin-top', 0)
      } else {
        var addArticleRewardEditor = new Editor({
          element: document.getElementById('articleRewardContent'),
          dragDrop: false,
          lineWrapping: true,
          htmlURL: Label.servePath + '/markdown',
          toolbar: [
            {name: 'emoji'},
            {name: 'bold'},
            {name: 'italic'},
            {name: 'quote'},
            {name: 'link'},
            {
              name: 'image',
              html: '<div class="tooltipped tooltipped-n" aria-label="' +
              Label.uploadFileLabel +
              '" ><form id="rewardFileUpload" method="POST" enctype="multipart/form-data"><label class="icon-upload"><svg><use xlink:href="#upload"></use></svg><input type="file"/></label></form></div>',
            },
            {name: 'unordered-list'},
            {name: 'ordered-list'},
            {name: 'view'},
            {name: 'fullscreen'},
            {name: 'question', action: 'https://hacpai.com/guide/markdown'},
          ],
          extraKeys: {
            'Alt-/': 'autocompleteUserName',
            'Ctrl-/': 'autocompleteEmoji',
            'Cmd-/': 'autocompleteEmoji',
            'Alt-S': 'startAudioRecord',
            'Alt-R': 'endAudioRecord',
          },
          status: false,
        })
        addArticleRewardEditor.render()
        AddArticle.rewardEditor = addArticleRewardEditor.codemirror

        AddArticle.rewardEditor.on('keydown', function (cm, evt) {
          if (8 === evt.keyCode) {
            var cursor = cm.getCursor()
            var token = cm.getTokenAt(cursor)

            // delete the whole emoji
            var preCursor = CodeMirror.Pos(cursor.line, cursor.ch)
            token = cm.getTokenAt(preCursor)
            if (/^:\S+:$/.test(token.string)) {
              cm.replaceRange('', CodeMirror.Pos(cursor.line, token.start),
                CodeMirror.Pos(cursor.line, token.end - 1))
            }
          }
        })

        AddArticle.rewardEditor.on('changes', function (cm) {
          var cursor = cm.getCursor()
          var token = cm.getTokenAt(cursor)
          if (token.string.indexOf('@') === 0) {
            cm.showHint({hint: CodeMirror.hint.userName, completeSingle: false})
            return CodeMirror.Pass
          }

          var postData = JSON.parse(localStorage.postData)
          postData.rewardContent = cm.getValue()
          localStorage.postData = JSON.stringify(postData)

          if ($('.article-reward-content .editor-preview-active').length ===
            0) {
            return false
          }

          $.ajax({
            url: Label.servePath + '/markdown',
            type: 'POST',
            cache: false,
            data: {
              markdownText: cm.getValue(),
            },
            success: function (result, textStatus) {
              $('.article-reward-content .editor-preview-active').
                html(result.html)
              hljs.initHighlighting.called = false
              hljs.initHighlighting()
              Util.parseMarkdown()
            },
          })
        })
      }
    }

    $('#articleContent').next().next().height(330)

    if ($('#articleAskPoint').length === 0) {
      if ('' !== postData.rewardContent) {
        $('#showReward').click()
        AddArticle.rewardEditor.setValue(postData.rewardContent)
      }

      if ('' !== postData.rewardPoint) {
        $('#showReward').click()
        $('#articleRewardPoint').val(postData.rewardPoint)
      }
      $('#articleRewardPoint').keyup(function () {
        var postData = JSON.parse(localStorage.postData)
        postData.rewardPoint = $(this).val()
        localStorage.postData = JSON.stringify(postData)
      })
    } else {
      $('#articleAskPoint').keyup(function() {
        var postData = JSON.parse(localStorage.postData)
        postData.QnAOfferPoint = $(this).val()
        localStorage.postData = JSON.stringify(postData)
      })
      if ('' !== postData.QnAOfferPoint && $('#articleAskPoint').val() === '') {
        $('#articleAskPoint').val(postData.QnAOfferPoint)
      }
    }
  },
  /**
   * @description \u521d\u59cb\u5316\u6807\u7b7e\u7f16\u8f91\u5668
   * @returns {undefined}
   */
  _initTag: function () {
    $.ua.set(navigator.userAgent)

    // \u6dfb\u52a0 tag \u5230\u8f93\u5165\u6846
    var addTag = function (text) {
      if (text.replace(/\s/g, '') === '') {
        return false
      }
      var hasTag = false
      text = text.replace(/\s/g, '').replace(/,/g, '')
      $('#articleTags').val('')

      // \u91cd\u590d\u6dfb\u52a0\u5904\u7406
      $('.tags-input .text').each(function () {
        var $it = $(this)
        if (text === $it.text()) {
          $it.parent().addClass('haved')
          setTimeout(function () {
            $it.parent().removeClass('haved')
          }, 900)
          hasTag = true
        }
      })

      if (hasTag) {
        return false
      }

      // \u957f\u5ea6\u5904\u7406
      if ($('.tags-input .tag').length >= 4) {
        $('#articleTags').val('').data('val', '')
        return false
      }

      $('.post .tags-selected').append('<span class="tag"><span class="text">'
        + text + '</span><span class="close">x</span></span>')
      $('#articleTags').
        width($('.tags-input').width() - $('.post .tags-selected').width() - 10)

      // set tags to localStorage
      if (location.search.indexOf('?id=') === -1) {
        var articleTags = ''
        $('.tags-input .tag .text').each(function () {
          articleTags += $(this).text() + ','
        })

        var postData = JSON.parse(localStorage.postData)
        postData.tags = articleTags
        localStorage.postData = JSON.stringify(postData)
      }

      if ($('.tags-input .tag').length >= 4) {
        $('#articleTags').val('').data('val', '')
      }
    }

    // domains \u5207\u6362
    $('.domains-tags .btn').click(function () {
      $('.domains-tags .btn.current').removeClass('current green')
      $(this).addClass('current').addClass('green')
      $('.domains-tags .domain-tags').hide()
      $('#tags' + $(this).data('id')).show()
    })

    // tag \u521d\u59cb\u5316\u6e32\u67d3
    var initTags = $('#articleTags').val().split(',')
    for (var j = 0, jMax = initTags.length; j < jMax; j++) {
      addTag(initTags[j])
    }

    // \u9886\u57df tag \u9009\u62e9
    $('.domain-tags .tag').click(function () {
      addTag($(this).text())
    })

    // \u79fb\u9664 tag
    $('.tags-input').on('click', '.tag > span.close', function () {
      $(this).parent().remove()
      $('#articleTags').
        width($('.tags-input').width() - $('.post .tags-selected').width() - 10)

      // set tags to localStorage
      if (location.search.indexOf('?id=') === -1) {
        var articleTags = ''
        $('.tags-input .tag .text').each(function () {
          articleTags += $(this).text() + ','
        })

        var postData = JSON.parse(localStorage.postData)
        postData.tags = articleTags
        localStorage.postData = JSON.stringify(postData)
      }
    })

    // \u5c55\u73b0\u9886\u57df tag \u9009\u62e9\u9762\u677f
    $('#articleTags').click(function () {
      $('.post .domains-tags').show()
      if ($.ua.device.type !== 'mobile') {
        $('.post .domains-tags').
          css('left', ($('.post .tags-selected').width() + 10) + 'px')
      }
      $('#articleTagsSelectedPanel').hide()
    }).blur(function () {
      if ($('#articleTagsSelectedPanel').css('display') === 'block') {
        // \u9f20\u6807\u70b9\u51fb completed \u9762\u677f\u65f6\u907f\u514d\u628a\u8f93\u5165\u6846\u7684\u503c\u52a0\u5165\u5230 tag \u4e2d
        return false
      }
      addTag($(this).val())
    })

    // \u5173\u95ed\u9886\u57df tag \u9009\u62e9\u9762\u677f
    $('body').click(function (event) {
      if ($(event.target).closest('.tags-input').length === 1 ||
        $(event.target).closest('.domains-tags').length === 1) {
      } else {
        $('.post .domains-tags').hide()
      }
    })

    // \u81ea\u52a8\u8865\u5168 tag
    $('#articleTags').completed({
      height: 170,
      onlySelect: true,
      data: [],
      afterSelected: function ($it) {
        addTag($it.text())
      },
      afterKeyup: function (event) {
        $('.post .domains-tags').hide()
        // \u9047\u5230\u5206\u8bcd\u7b26\u53f7\u81ea\u52a8\u6dfb\u52a0\u6807\u7b7e
        if (event.key === ',' || event.key === '\uff0c' ||
          event.key === '\u3001' || event.key === '\uff1b' || event.key === ';') {
          var text = $('#articleTags').val()
          addTag(text.substr(0, text.length - 1))
          return false
        }

        // \u56de\u8f66\uff0c\u81ea\u52a8\u6dfb\u52a0\u6807\u7b7e
        if (event.keyCode === 13) {
          addTag($('#articleTags').val())
          return false
        }

        // \u4e0a\u4e0b\u5de6\u53f3
        if (event.keyCode === 37 || event.keyCode === 39 ||
          event.keyCode === 38 || event.keyCode === 40) {
          return false
        }

        // ECS \u9690\u85cf\u9762\u677f
        if (event.keyCode === 27) {
          $('#articleTagsSelectedPanel').hide()
          return false
        }

        // \u5220\u9664 tag
        if (event.keyCode === 8 && event.data.settings.chinese === 8
          && event.data.settings.keydownVal.replace(/\s/g, '') === '') {
          $('.tags-input .tag .close:last').click()
          return false
        }

        if ($('#articleTags').val().replace(/\s/g, '') === '') {
          return false
        }

        $.ajax({
          url: Label.servePath + '/tags/query?title=' + $('#articleTags').val(),
          error: function (jqXHR, textStatus, errorThrown) {
            $('#addArticleTip').
              addClass('error').
              html('<ul><li>' + errorThrown + '</li></ul>')
          },
          success: function (result, textStatus) {
            if (result.sc) {
              if ($.ua.device.type !== 'mobile') {
                $('#articleTagsSelectedPanel').
                  css('left', ($('.post .tags-selected').width() + 10) + 'px')
              }
              $('#articleTags').completed('updateData', result.tags)
            } else {
              console.log(result)
            }
          },
        })
      },
    })
  },
}

AddArticle.init()