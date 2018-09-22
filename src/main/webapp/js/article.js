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
 * @fileoverview article page and add comment.
 *
 * @author <a href="http://vanessa.b3log.org">Liyuan Li</a>
 * @author <a href="http://88250.b3log.org">Liang Ding</a>
 * @version 1.42.1.0, Aug 28, 2018
 */

/**
 * @description Add comment function.
 * @static
 */
var Comment = {
  editor: undefined,
  /**
   * \u4e3e\u62a5
   * @param it
   */
  report: function (it) {
    var $btn = $(it)
    $btn.attr('disabled', 'disabled').css('opacity', '0.3')
    $.ajax({
      url: Label.servePath + '/report',
      type: 'POST',
      cache: false,
      data: JSON.stringify({
        reportDataId: $('#reportDialog').data('id'),
        reportDataType: $('#reportDialog').data('type'),
        reportType: $('input[name=report]:checked').val( ),
        reportMemo: $('#reportTextarea').val()
      }),
      complete: function (result) {
        $btn.removeAttr('disabled').css('opacity', '1')
        if (result.responseJSON.sc === 0) {
          Util.alert(Label.reportSuccLabel)
          $('#reportTextarea').val('')
          $('#reportDialog').dialog('close')
        } else {
          Util.alert(result.responseJSON.msg)
        }
      },
    })
  },
  /**
   * \u91c7\u7eb3\u8bc4\u8bba
   * @param tip
   * @param id
   */
  accept: function (tip, id, it) {
    if (!confirm(tip)) {
      return
    }
    $.ajax({
      url: Label.servePath + '/comment/accept',
      type: 'POST',
      headers: {'csrfToken': Label.csrfToken},
      cache: false,
      data: JSON.stringify({
        commentId: id,
      }),
      success: function (result) {
        if (!result.sc) {
          Util.alert(result.msg)
          return
        } else {
          $(it).closest('li').addClass('cmt-perfect')
          $(it).remove()
        }
      },
    })
  },
  /**
   * \u5220\u9664\u8bc4\u8bba
   * @param {integer} id \u8bc4\u8bba id
   */
  remove: function (id) {
    if (!confirm(Label.confirmRemoveLabel)) {
      return false
    }
    $.ajax({
      url: Label.servePath + '/comment/' + id + '/remove',
      type: 'POST',
      cache: false,
      success: function (result, textStatus) {
        if (result.sc === 0) {
          $('#' + id).remove()
        } else {
          Util.alert(result.msg)
        }
      },
    })
  },
  /**
   * \u5207\u6362\u8bc4\u8bba\u6392\u5e8f\u6a21\u5f0f
   * @param {integer} mode \u6392\u5e8f\u6a21\u5f0f\uff1a0 \u4f20\u7edf\u6a21\u5f0f\uff0c\u6b63\u5e8f\uff1b1 \u5b9e\u65f6\u6a21\u5f0f\uff0c\u5012\u5e8f
   * @returns {undefined}
   */
  exchangeCmtSort: function (mode) {
    mode = 0 === mode ? 1 : 0

    window.location.href = window.location.pathname + '?m=' + mode
  },
  /**
   * \u80cc\u666f\u6e10\u53d8
   * @param {jQuery} $obj \u80cc\u666f\u6e10\u53d8\u5bf9\u8c61
   * @returns {undefined}
   */
  _bgFade: function ($obj) {
    if ($obj.length === 0) {
      return false
    }

    $(window).scrollTop($obj[0].offsetTop - 48)

    if ($obj.attr('id') === 'comments') {
      return false
    }

    $obj.css({
      'background-color': '#9bbee0',
    })
    setTimeout(function () {
      $obj.css({
        'background-color': '#FFF',
        'transition': 'all 3s cubic-bezier(0.56, -0.36, 0.58, 1)',
      })
    }, 100)
    setTimeout(function () {
      $obj.removeAttr('style')
    }, 3100)
  },
  /**
   * \u7f16\u8f91\u8bc4\u8bba
   * @param {string} id \u8bc4\u8bba id
   */
  edit: function (id) {
    Comment._toggleReply()
    $('.cmt-anonymous').hide()
    $.ajax({
      url: Label.servePath + '/comment/' + id + '/content',
      type: 'GET',
      cache: false,
      success: function (result, textStatus) {
        if (result.sc === 0) {
          // doc.lineCount
          Comment.editor.setValue(result.commentContent)
        }
      },
    })

    $('#replyUseName').
      html('<a href="javascript:void(0)" onclick="Comment._bgFade($(\'#' +
        id +
        '\'))" class="ft-a-title"><svg><use xlink:href="#edit"></use></svg> ' +
        Label.commonUpdateCommentPermissionLabel + '</a>').
      data('commentId', id)
  },
  /**
   * \u8df3\u8f6c\u5230\u6307\u5b9a\u7684\u8bc4\u8bba\u5904
   * @param {string} url \u8df3\u8f6c\u7684 url
   */
  goComment: function (url) {
    if ($(url.substr(url.length - 14, 14)).length === 0) {
      window.location = url
      return false
    }

    $('#comments .list > ul > li').removeAttr('style')
    Comment._bgFade($(url.substr(url.length - 14, 14)))
  },
  /**
   * \u8bbe\u7f6e\u8bc4\u8bba\u6765\u6e90
   * @returns {Boolean}
   */
  _setCmtVia: function () {
    $('.cmt-via').each(function () {
      var ua = $(this).data('ua'),
        name = Util.getDeviceByUa(ua)
      if (name !== '') {
        $(this).html('via ' + name)
      }
    })
  },
  /**
   * \u56de\u590d\u9762\u677f\u663e\u793a\uff0f\u9690\u85cf
   * @param {function} cb \u9762\u677f\u5f39\u51fa\u540e\u7684\u56de\u6389\u51fd\u6570
   */
  _toggleReply: function (cb) {
    if (!Label.isLoggedIn) {
      Util.needLogin()
      return false
    }
    if ($('#commentContent').length === 0) {
      Util.alert(Label.notAllowCmtLabel)
      return false
    }
    if ($(this).data('hasPermission') === 'false') {
      Article.permissionTip(Label.noPermissionLabel)
      return false
    }

    if ($('.footer').attr('style')) {
      $('.editor-panel .wrapper').slideUp(function () {
        $('.editor-panel').hide()
        $('.footer').removeAttr('style')
      })
      return false
    }

    $('.cmt-anonymous').show()

    $('.footer').
      css('margin-bottom', $('.editor-panel > .wrapper').outerHeight() + 'px')
    $('#replyUseName').
      html('<a href="javascript:void(0)" onclick="Comment._bgFade($(\'.article-content\'))" class="ft-a-title"><svg><use xlink:href="#reply-to"></use></svg>'
        + $('.article-title').text().replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</a>').
      removeData()

    // \u5982\u679c hide \u521d\u59cb\u5316\uff0c focus \u65e0\u6548
    if ($('.editor-panel').css('bottom') !== '0px') {
      $('.editor-panel .wrapper').hide()
      $('.editor-panel').css('bottom', 0)
    }

    $('.editor-panel').show()
    $('.editor-panel .wrapper').slideDown(function () {
      Comment.editor.focus()
      cb ? cb() : ''
    })
  },
  /**
   * \u521d\u59cb\u5316\u5e16\u5b50
   * @returns {undefined}
   */
  _initHotKey: function () {
    if (!Label.userKeyboardShortcutsStatus ||
      Label.userKeyboardShortcutsStatus === '1') {
      return false
    }

    $(document).bind('keyup', 'x', function assets () {
      // listen jump hotkey h
      Util.prevKey = 'x'
      setTimeout(function () {
        Util.prevKey = undefined
      }, 1000)
      return false
    }).bind('keyup', 'v', function assets () {
      // listen jump hotkey h
      Util.prevKey = 'v'
      setTimeout(function () {
        Util.prevKey = undefined
      }, 1000)
      return false
    }).bind('keydown', 'r', function assets (event) {
      if (!Util.prevKey) {
        // r \u56de\u590d\u5e16\u5b50
        Comment._toggleReply()
      } else if (Util.prevKey === 'v') {
        // v r \u6253\u8d4f\u5e16\u5b50
        $('#articleRewardContent .icon-points').click()
      } else if ($('#comments .list > ul > li.focus').length === 1 &&
        Util.prevKey === 'x') {
        // x r \u56de\u590d\u56de\u5e16
        $('#comments .list > ul > li.focus .icon-reply').parent().click()
      }
      return false
    }).bind('keyup', 'h', function assets () {
      // x h \u611f\u8c22\u9009\u4e2d\u56de\u8d34
      if ($('#comments .list > ul > li.focus').length === 1 && Util.prevKey ===
        'x') {
        $('#comments .list > ul > li.focus .icon-heart').parent().click()
      }
      return false
    }).bind('keyup', 't', function assets () {
      // x t \u8d5e\u540c\u9009\u4e2d\u56de\u8d34
      if ($('#comments .list > ul > li.focus').length === 1 && Util.prevKey ===
        'x') {
        $('#comments .list > ul > li.focus .icon-thumbs-up').parent().click()
      }
      return false
    }).bind('keyup', 'd', function assets () {
      // x d \u53cd\u5bf9\u9009\u4e2d\u56de\u8d34
      if ($('#comments .list > ul > li.focus').length === 1 && Util.prevKey ===
        'x') {
        $('#comments .list > ul > li.focus .icon-thumbs-down').parent().click()
      }
      return false
    }).bind('keyup', 'c', function assets () {
      // x c \u67e5\u770b\u9009\u4e2d\u56de\u590d\u7684\u56de\u8d34
      if ($(
        '#comments .list > ul > li.focus .comment-info .icon-reply-to').length ===
        1 && Util.prevKey === 'x') {
        $('#comments .list > ul > li.focus .comment-info .icon-reply-to').
          parent().
          click()
      }
      return false
    }).bind('keyup', 'm', function assets () {
      // x\u00a0m\u00a0\u67e5\u770b\u9009\u4e2d\u56de\u8d34\u7684\u56de\u590d
      if ($(
        '#comments .list > ul > li.focus .comment-action > .ft-fade > .fn-pointer').length ===
        1 && Util.prevKey === 'x') {
        $('#comments .list > ul > li.focus .comment-action > .ft-fade > .fn-pointer').
          click()
      }
      return false
    }).bind('keyup', 'a', function assets () {
      // x a \u7ba1\u7406\u5458\u7f16\u8f91\u9009\u4e2d\u7684\u56de\u8d34
      if (Util.prevKey === 'x' &&
        $('#comments .list > ul > li.focus .icon-setting').parent().length ===
        1) {
        window.location = $('#comments .list > ul > li.focus .icon-setting').
          parent().
          attr('href')
      }
      return false
    }).bind('keyup', 'm', function assets () {
      // v m \u5e16\u5b50\u76ee\u5f55
      if (Util.prevKey === 'v') {
        Article.toggleToc()
      }
      return false
    }).bind('keyup', 'h', function assets () {
      // v h \u611f\u8c22\u5e16\u5b50
      if (Util.prevKey === 'v') {
        $('#thankArticle').click()
      }
      return false
    }).bind('keyup', 't', function assets () {
      // v t \u8d5e\u540c\u5e16\u5b50
      if (Util.prevKey === 'v') {
        $('.article-header .icon-thumbs-up').parent().click()
      }
      return false
    }).bind('keyup', 'd', function assets () {
      // v d \u53cd\u5bf9\u5e16\u5b50
      if (Util.prevKey === 'v') {
        $('.article-header .icon-thumbs-down').parent().click()
      }
      return false
    }).bind('keyup', 'i', function assets () {
      // v i \u5173\u6ce8\u5e16\u5b50
      if (Util.prevKey === 'v') {
        $('.article-header .icon-view').parent().click()
      }
      return false
    }).bind('keyup', 'c', function assets () {
      // v c \u6536\u85cf\u5e16\u5b50
      if (Util.prevKey === 'v') {
        $('.article-header .icon-star').parent().click()
      }
      return false
    }).bind('keyup', 'l', function assets () {
      // v l \u67e5\u770b\u5e16\u5b50\u5386\u53f2
      if (Util.prevKey === 'v') {
        $('.article-header .icon-history').parent().click()
      }
      return false
    }).bind('keyup', 'e', function assets () {
      // v e \u7f16\u8f91\u5e16\u5b50
      if (Util.prevKey === 'v' &&
        $('.article-actions .icon-edit').parent().length === 1) {
        window.location = $('.article-actions .icon-edit').
          parent().
          attr('href')
      }
      return false
    }).bind('keyup', 's', function assets () {
      // v s \u7f6e\u9876\u5e16\u5b50
      if (Util.prevKey === 'v' &&
        $('.article-actions .icon-chevron-up').length === 1) {
        Article.stick(Label.articleOId)
      }
      return false
    }).bind('keyup', 'a', function assets () {
      // v a \u7ba1\u7406\u5458\u7f16\u8f91\u5e16\u5b50
      if (Util.prevKey === 'v' &&
        $('.article-actions .icon-setting').parent().length === 1) {
        window.location = $('.article-actions .icon-setting').
          parent().
          attr('href')
      }
      return false
    }).bind('keyup', 'p', function assets () {
      // v p \u8df3\u8f6c\u5230\u4e0a\u4e00\u7bc7\u5e16\u5b50 prev
      if (Util.prevKey === 'v' && $('.article-header a[rel=prev]').length ===
        1) {
        window.location = $('.article-header a[rel=prev]').attr('href')
      }
      return false
    }).bind('keyup', 'n', function assets () {
      // v n \u8df3\u8f6c\u5230\u4e0b\u4e00\u7bc7\u5e16\u5b50 next
      if (Util.prevKey === 'v' && $('.article-header a[rel=next]').length ===
        1) {
        window.location = $('.article-header a[rel=next]').attr('href')
      }
      return false
    })
  },
  /**
   * \u8bc4\u8bba\u521d\u59cb\u5316
   * @returns {Boolean}
   */
  init: function () {
    if ($(window.location.hash).length === 1) {
      // if (!isNaN(parseInt(window.location.hash.substr(1)))) {
      Comment._bgFade($(window.location.hash))
      //}
    }

    this._setCmtVia()
    this._initHotKey()

    $.pjax({
      selector: '#comments .pagination a',
      container: '#comments',
      show: '',
      cache: false,
      storage: true,
      titleSuffix: '',
      callback: function () {
        Util.parseMarkdown()
      },
    })
    NProgress.configure({showSpinner: false})
    $('#comments').bind('pjax.start', function () {
      NProgress.start()
    })
    $('#comments').bind('pjax.end', function () {
      NProgress.done()
    })

    if (!Label.isLoggedIn || !document.getElementById('commentContent')) {
      return false
    }

    Util.initCodeMirror()

    var commentEditor = new Editor({
      element: document.getElementById('commentContent'),
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
          '" ><form id="fileUpload" method="POST" enctype="multipart/form-data"><label class="icon-upload"><svg><use xlink:href="#upload"></use></svg><input type="file"/></label></form></div>',
        },
        {name: 'unordered-list'},
        {name: 'ordered-list'},
        {name: 'view'},
        {name: 'fullscreen'},
        {name: 'question', action: 'https://hacpai.com/guide/markdown'},
      ],
      extraKeys: {
        'Alt-/': 'autocompleteUserName',
        'Cmd-/': 'autocompleteEmoji',
        'Ctrl-/': 'autocompleteEmoji',
        'Alt-S': 'startAudioRecord',
        'Alt-R': 'endAudioRecord',
        'Esc': function () {
          $('.editor-hide').click()
        },
      },
      status: false,
    })
    commentEditor.render()

    commentEditor.codemirror['for'] = 'comment'

    Comment.editor = commentEditor.codemirror

    if (window.localStorage && window.localStorage[Label.articleOId]) {
      var localData = null

      try {
        localData = JSON.parse(window.localStorage[Label.articleOId])
      } catch (e) {
        var emptyContent = {
          commentContent: '',
        }

        window.localStorage[Label.articleOId] = JSON.stringify(emptyContent)
        localData = JSON.parse(window.localStorage[Label.articleOId])
      }

      if ('' !== localData.commentContent.replace(/(^\s*)|(\s*$)/g, '')) {
        Comment.editor.setValue(localData.commentContent)
      }
    }

    Comment.editor.on('changes', function (cm) {
      $('#addCommentTip').removeClass('error succ').html('')

      if (window.localStorage) {
        window.localStorage[Label.articleOId] = JSON.stringify({
          commentContent: cm.getValue(),
        })
      }

      var cursor = cm.getCursor()
      var token = cm.getTokenAt(cursor)

      if (token.string.indexOf('@') === 0) {
        cm.showHint({hint: CodeMirror.hint.userName, completeSingle: false})
        return
      }

      if ($('.editor-preview-active').length === 0) {
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
          $('.article-comment-content .editor-preview-active').
            html(result.html)
          hljs.initHighlighting.called = false
          hljs.initHighlighting()
          Util.parseMarkdown()
        },
      })
    })

    Comment.editor.on('keypress', function (cm, evt) {
      if (evt.ctrlKey && 10 === evt.charCode) {
        Comment.add(Label.articleOId, Label.csrfToken)
        return false
      }
    })

    Comment.editor.on('keydown', function (cm, evt) {
      // mac command + enter add article
      $.ua.set(navigator.userAgent)
      if ($.ua.os.name.indexOf('Mac OS') > -1 && evt.metaKey && evt.keyCode ===
        13) {
        Comment.add(Label.articleOId, Label.csrfToken)
        return false
      }
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
  },
  /**
   * @description \u611f\u8c22\u8bc4\u8bba.
   * @param {String} id \u8bc4\u8bba id
   * @param {String} csrfToken CSRF \u4ee4\u724c
   * @param {String} tip \u786e\u8ba4\u63d0\u793a
   * @param {Integer} 0\uff1a\u516c\u5f00\u8bc4\u8bba\uff0c1\uff1a\u533f\u540d\u8bc4\u8bba
   */
  thank: function (id, csrfToken, tip, commentAnonymous, it) {
    if (!Label.isLoggedIn) {
      Util.needLogin()
      return false
    }

    // \u533f\u540d\u56de\u5e16\u4e0d\u9700\u8981\u8fdb\u884c confirm
    if (0 === commentAnonymous && !confirm(tip)) {
      return false
    }

    var requestJSONObject = {
      commentId: id,
    }

    $.ajax({
      url: Label.servePath + '/comment/thank',
      type: 'POST',
      headers: {'csrfToken': csrfToken},
      cache: false,
      data: JSON.stringify(requestJSONObject),
      error: function (jqXHR, textStatus, errorThrown) {
        Util.alert(errorThrown)
      },
      success: function (result, textStatus) {
        if (result.sc) {
          $(it).removeAttr('onclick')
          var $heart = $(
            '<svg class="ft-red"><use xlink:href="#heart"></use></svg>'),
            y = $(it).offset().top,
            x = $(it).offset().left
          $heart.css({
            'z-index': 9999,
            'top': y,
            'left': x,
            'position': 'absolute',
            'font-size': 16,
            '-moz-user-select': 'none',
            '-webkit-user-select': 'none',
            '-ms-user-select': 'none',
          })
          $('body').append($heart)

          $heart.animate({'left': x - 150, 'top': y - 60, 'opacity': 0},
            1000,
            function () {
              var cnt = parseInt($(it).text())

              $(it).
                html('<svg><use xlink:href="#heart"></use></svg> ' + (cnt + 1)).
                addClass('ft-red')

              $heart.remove()
            }
          )

        } else {
          Util.alert(result.msg)
        }
      },
    })
  },
  /**
   * @description \u5c55\u73b0\u56de\u5e16\u56de\u590d\u5217\u8868
   * @param {type} id \u56de\u5e16 id
   * @returns {Boolean}
   */
  showReply: function (id, it, className) {
    var $commentReplies = $(it).closest('li').find('.' + className)

    if ('comment-get-comment' === className) {
      if ($commentReplies.find('li').length !== 0) {
        $commentReplies.html('')
        return false
      }
    } else {
      if ($(it).find('.icon-chevron-down').length === 0) {
        // \u6536\u8d77\u56de\u590d
        $(it).
          find('.icon-chevron-up').
          removeClass('icon-chevron-up').
          addClass('icon-chevron-down').
          find('use').
          attr('xlink:href', '#chevron-down')

        $commentReplies.html('')
        return false
      }
    }

    if ($(it).css('opacity') === '0.3') {
      return false
    }

    var url = '/comment/replies'
    if ('comment-get-comment' === className) {
      url = '/comment/original'
    }

    $.ajax({
      url: Label.servePath + url,
      type: 'POST',
      data: JSON.stringify({
        commentId: id,
        userCommentViewMode: Label.userCommentViewMode,
      }),
      beforeSend: function () {
        $(it).css('opacity', '0.3')
      },
      success: function (result, textStatus) {
        if (!result.sc) {
          Util.alert(result.msg)
          return false
        }

        var comments = result.commentReplies,
          template = ''
        if (!(comments instanceof Array)) {
          comments = [comments]
        }

        if (comments.length === 0) {
          template = '<li class="ft-red">' + Label.removedLabel + '</li>'
        }

        for (var i = 0; i < comments.length; i++) {
          var data = comments[i]

          template += '<li><div class="fn-flex">'

          if (data.commentAuthorName !== 'someone') {
            template += '<a rel="nofollow" href="/member/' +
              data.commentAuthorName + '">'
          }
          template += '<div class="avatar tooltipped tooltipped-se" aria-label="' +
            data.commentAuthorName + '" style="background-image:url('
            + data.commentAuthorThumbnailURL + ')"></div>'
          if (data.commentAuthorName !== 'someone') {
            template += '</a>'
          }

          template += '<div class="fn-flex-1">'
            + '<div class="comment-info ft-smaller">'

          if (data.commentAuthorName !== 'someone') {
            template += '<a class="ft-gray" rel="nofollow" href="/member/' +
              data.commentAuthorName + '">'
          }
          template += data.commentAuthorName
          if (data.commentAuthorName !== 'someone') {
            template += '</a>'
          }

          template += '<span class="ft-fade"> \u2022 ' + data.timeAgo
          if (data.rewardedCnt > 0) {
            template += '<span aria-label="'
              + (data.rewarded ? Label.thankedLabel : Label.thankLabel + ' ' +
                data.rewardedCnt)
              + '" class="tooltipped tooltipped-n '
              + (data.rewarded ? 'ft-red' : 'ft-fade') + '">'
              +
              ' <svg class="fn-text-top"><use xlink:href="#heart"></use></svg> ' +
              data.rewardedCnt + '</span> '
          }

          template += ' ' + Util.getDeviceByUa(data.commentUA) + '</span>'

          template += '<a class="tooltipped tooltipped-nw ft-a-title fn-right" aria-label="' +
            Label.referenceLabel + '" href="javascript:Comment.goComment(\''
            + Label.servePath + '/article/' + Label.articleOId + '?p=' +
            data.paginationCurrentPageNum
            + '&m=' + Label.userCommentViewMode + '#' + data.oId
            +
            '\')"><svg><use xlink:href="#quote"></use></svg></a></div><div class="content-reset comment">'
            + data.commentContent + '</div></div></div></li>'
        }
        $commentReplies.html('<ul>' + template + '</ul>')
        Article.parseLanguage()

        // \u5982\u679c\u662f\u56de\u5e16\u7684\u56de\u590d\u9700\u8981\u5904\u7406\u4e0b\u6837\u5f0f
        $(it).
          find('.icon-chevron-down').
          removeClass('icon-chevron-down').
          addClass('icon-chevron-up').
          find('use').
          attr('xlink:href', '#chevron-up')
      },
      error: function (result) {
        Util.alert(result.statusText)
      },
      complete: function () {
        $(it).css('opacity', '1')
      },
    })
  },
  /**
   * @description \u6dfb\u52a0\u8bc4\u8bba
   * @param {String} id \u6587\u7ae0 id
   * @param {String} csrfToken CSRF \u4ee4\u724c
   * @param {BOM} it targetElement
   */
  add: function (id, csrfToken, it) {
    if (!Validate.goValidate({
      target: $('#addCommentTip'),
      data: [
        {
          'target': Comment.editor,
          'type': 'editor',
          'max': 2000,
          'msg': Label.commentErrorLabel,
        }],
    })) {
      return false
    }

    var requestJSONObject = {
      articleId: id,
      commentAnonymous: $('#commentAnonymous').prop('checked'),
      commentVisible: $('#commentVisible').prop('checked'),
      commentContent: Comment.editor.getValue(), // \u5b9e\u9645\u63d0\u4ea4\u65f6\u4e0d\u53bb\u9664\u7a7a\u683c\uff0c\u56e0\u4e3a\u76f4\u63a5\u8d34\u4ee3\u7801\u65f6\u9700\u8981\u7a7a\u683c
      userCommentViewMode: Label.userCommentViewMode,
    }

    if ($('#replyUseName').data('commentOriginalCommentId')) {
      requestJSONObject.commentOriginalCommentId = $('#replyUseName').
        data('commentOriginalCommentId')
    }

    var url = Label.servePath + '/comment',
      type = 'POST',
      commentId = $('#replyUseName').data('commentId')
    if (commentId) {
      url = Label.servePath + '/comment/' + commentId
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
        Comment.editor.setOption('readOnly', 'nocursor')
      },
      success: function (result, textStatus) {
        $(it).removeAttr('disabled').css('opacity', '1')

        if (0 === result.sc) {
          // edit cmt
          if (commentId) {
            $('#' + commentId + ' > .fn-flex > .fn-flex-1 > .content-reset').
              html(result.commentContent)
            $('#' + commentId + ' .icon-history').parent().show()
          }

          if (requestJSONObject.commentOriginalCommentId) {
            Util.setUnreadNotificationCount()
          }

          // reset comment editor
          Comment.editor.setValue('')
          $('.editor-preview').html('')
          if ($('.icon-view').parent().hasClass('active')) {
            $('.icon-view').click()
          }

          // hide comment panel
          $('.editor-hide').click()

          // clear reply comment
          $('#replyUseName').text('').removeData()

          // clear local storage
          if (window.localStorage) {
            var emptyContent = {
              commentContent: '',
            }

            window.localStorage[Label.articleOId] = JSON.stringify(
              emptyContent)
          }

          // \u5b9a\u4e3a\u5230\u56de\u8d34\u4f4d\u7f6e
          if (Label.userCommentViewMode === 1) {
            // \u5b9e\u65f6\u6a21\u5f0f
            Comment._bgFade($('#comments'))
          } else {
            Comment._bgFade($('#bottomComment'))
          }
        } else {
          $('#addCommentTip').
            addClass('error').
            html('<ul><li>' + result.msg + '</li></ul>')
        }
      },
      error: function (result) {
        $('#addCommentTip').
          addClass('error').
          html('<ul><li>' + result.statusText + '</li></ul>')
      },
      complete: function () {
        $(it).removeAttr('disabled').css('opacity', '1')
        Comment.editor.setOption('readOnly', false)
      },
    })
  },
  /**
   * @description \u70b9\u51fb\u56de\u590d\u8bc4\u8bba\u65f6\uff0c\u628a\u5f53\u697c\u5c42\u7684\u7528\u6237\u540d\u5e26\u5230\u8bc4\u8bba\u6846\u4e2d
   * @param {String} userName \u7528\u6237\u540d\u79f0
   */
  reply: function (userName, id) {
    Comment._toggleReply(function () {
      // \u56de\u5e16\u5728\u5e95\u90e8\uff0c\u5f53\u8bc4\u8bba\u6846\u5f39\u51fa\u65f6\u4f1a\u88ab\u906e\u4f4f\u7684\u89e3\u51b3\u65b9\u6848
      if ($(window).height() -
        ($('#' + id)[0].offsetTop - $(window).scrollTop() +
          $('#' + id).outerHeight()) <
        $('.editor-panel .wrapper').outerHeight()) {
        $(window).scrollTop($('#' + id)[0].offsetTop -
          ($(window).height() - $('.editor-panel .wrapper').outerHeight() -
            $('#' + id).outerHeight()))
      }
    })

    // \u5e16\u5b50\u4f5c\u8005 clone \u5230\u7f16\u8f91\u5668\u5de6\u4e0a\u89d2
    var replyUserHTML = '',
      $avatar = $('#' + id).find('>.fn-flex>div>a').clone()
    if ($avatar.length === 0) {
      $avatar = $('#' + id).find('>.fn-flex .avatar').clone()
      $avatar.removeClass('avatar').addClass('avatar-small')
      replyUserHTML = '<a rel="nofollow" href="#' + id
        + '" class="ft-a-title" onclick="Comment._bgFade($(\'#' + id
        + '\'))"><svg><use xlink:href="#reply-to"></use></svg> '
        + $avatar[0].outerHTML + ' ' + userName + '</a>'
    } else {
      $avatar.addClass('ft-a-title').
        attr('href', '#' + id).
        attr('onclick', 'Comment._bgFade($("#' + id + '"))')
      $avatar.find('div').
        removeClass('avatar').
        addClass('avatar-small').
        after(' ' + userName).
        before('<svg><use xlink:href="#reply-to"></use></svg> ')
      replyUserHTML = $avatar[0].outerHTML
    }

    $('#replyUseName').html(replyUserHTML).data('commentOriginalCommentId', id)
  },
}

var Article = {
  initAudio: function () {
    $('.content-audio').each(function () {
      var $it = $(this)
      new APlayer({
        element: this,
        narrow: false,
        autoplay: false,
        mutex: true,
        theme: '#4285f4',
        preload: 'none',
        mode: 'circulation',
        music: {
          title: $it.data('title'),
          author: '<a href="https://hacpai.com/article/1464416402922" target="_blank">\u97f3\u4e50\u5206\u4eab</a>',
          url: $it.data('url'),
          pic: Label.staticServePath + '/images/music.png',
        },
      })
    })

    var $articleAudio = $('#articleAudio')
    if ($articleAudio.length === 0) {
      return false
    }

    new APlayer({
      element: document.getElementById('articleAudio'),
      narrow: false,
      autoplay: false,
      mutex: true,
      theme: '#4285f4',
      mode: 'order',
      preload: 'none',
      music: {
        title: '\u8bed\u97f3\u9884\u89c8',
        author: '<a href="https://hacpai.com/member/v" target="_blank">\u5c0f\u8587</a>',
        url: $articleAudio.data('url'),
        pic: Label.staticServePath + '/images/blank.png',
      },
    })
  },
  /**
   * @description \u6ca1\u6709\u6743\u9650\u7684\u63d0\u793a
   * @param {String} tip \u63d0\u793a\u5185\u5bb9
   */
  permissionTip: function (tip) {
    if (Label.isLoggedIn) {
      Util.alert(tip)
    } else {
      Util.needLogin()
    }
  },
  /**
   * @description \u8d5e\u540c
   * @param {String} id \u8d5e\u540c\u7684\u5b9e\u4f53\u6570\u636e id
   * @param {String} type \u8d5e\u540c\u7684\u5b9e\u4f53\u7c7b\u578b
   */
  voteUp: function (id, type, it) {
    if (!Label.isLoggedIn) {
      Util.needLogin()
      return false
    }

    var $voteUp = $(it)
    var $voteDown = $voteUp.next()

    if ($voteUp.hasClass('disabled')) {
      return false
    }

    var requestJSONObject = {
      dataId: id,
    }

    $voteUp.addClass('disabled')

    $.ajax({
      url: Label.servePath + '/vote/up/' + type,
      type: 'POST',
      cache: false,
      data: JSON.stringify(requestJSONObject),
      success: function (result, textStatus) {
        $voteUp.removeClass('disabled')
        var upCnt = parseInt($voteUp.text()),
          downCnt = parseInt($voteDown.text())
        if (result.sc) {
          if (0 === result.type) { // cancel up
            $voteUp.html('<svg class="icon-thumbs-up"><use xlink:href="#thumbs-up"></use></svg> ' +
              (upCnt - 1)).removeClass('ft-red')
          } else {
            $voteUp.html('<svg class="icon-thumbs-up"><use xlink:href="#thumbs-up"></use></svg> ' +
              (upCnt + 1)).addClass('ft-red')
            if ($voteDown.hasClass('ft-red')) {
              $voteDown.html('<svg class="icon-thumbs-down"><use xlink:href="#thumbs-down"></use></svg> ' +
                (downCnt - 1)).removeClass('ft-red')
            }
          }

          return
        }

        Util.alert(result.msg)
      },
    })
  },
  /**
   * @description \u53cd\u5bf9
   * @param {String} id \u53cd\u5bf9\u7684\u5b9e\u4f53\u6570\u636e id
   * @param {String} type \u53cd\u5bf9\u7684\u5b9e\u4f53\u7c7b\u578b
   */
  voteDown: function (id, type, it) {
    if (!Label.isLoggedIn) {
      Util.needLogin()
      return false
    }
    var $voteDown = $(it)
    var $voteUp = $voteDown.prev()

    if ($voteDown.hasClass('disabled')) {
      return false
    }

    var requestJSONObject = {
      dataId: id,
    }

    $voteDown.addClass('disabled')

    $.ajax({
      url: Label.servePath + '/vote/down/' + type,
      type: 'POST',
      cache: false,
      data: JSON.stringify(requestJSONObject),
      success: function (result, textStatus) {
        $voteDown.removeClass('disabled')
        var upCnt = parseInt($voteUp.text()),
          downCnt = parseInt($voteDown.text())
        if (result.sc) {
          if (1 === result.type) { // cancel down
            $voteDown.html('<svg class="icon-thumbs-down"><use xlink:href="#thumbs-down"></use></svg> ' +
              (downCnt - 1)).removeClass('ft-red')
          } else {
            $voteDown.html('<svg class="icon-thumbs-down"><use xlink:href="#thumbs-down"></use></svg> ' +
              (downCnt + 1)).addClass('ft-red')
            if ($voteUp.hasClass('ft-red')) {
              $voteUp.html('<svg class="icon-thumbs-up"><use xlink:href="#thumbs-up"></use></svg> ' +
                (upCnt - 1)).removeClass('ft-red')
            }
          }

          return false
        }

        Util.alert(result.msg)
      },
    })
  },
  /**
   * @description \u5927\u56fe\u9884\u89c8\u7b49\u5f85\u83b7\u53d6\u5927\u5c0f\u540e\u91cd\u5236 translate
   */
  previewImgAfterLoading: function () {
    $('.img-preview img').css('transform', 'translate3d(' +
      (Math.max(0, $(window).width() - $('.img-preview img').width()) / 2) +
      'px, ' +
      (Math.max(0, $(window).height() - $('.img-preview img').height()) / 2) +
      'px, 0)')

    // fixed chrome render transform bug
    setTimeout(function () {
      $('.img-preview').width($(window).width())
    }, 300)
  },
  /**
   * @description \u521d\u59cb\u5316\u6587\u7ae0
   */
  init: function () {
    this.initToc()
    this.share()
    this.parseLanguage()

    // img preview
    var fixDblclick = null
    $('.article').on('dblclick', '.content-reset img', function () {
      clearTimeout(fixDblclick)
      if ($(this).hasClass('emoji') ||
        $(this).closest('.editor-panel').length === 1 ||
        $(this).closest('.ad').length === 1) {
        return
      }
      window.open($(this).attr('src'))
    }).on('click', '.content-reset img', function (event) {
      clearTimeout(fixDblclick)
      if ($(this).hasClass('emoji') ||
        $(this).closest('.editor-panel').length === 1 ||
        $(this).closest('.ad').length === 1) {
        return
      }
      var $it = $(this),
        it = this
      fixDblclick = setTimeout(function () {
        var top = it.offsetTop,
          left = it.offsetLeft
        if ($it.closest('.comments').length === 1) {
          top = top + $it.closest('li')[0].offsetTop
          left = left + $('.comments')[0].offsetLeft + 15
        }

        $('body').
          append('<div class="img-preview" onclick="$(this).remove()"><img style="transform: translate3d(' +
            Math.max(0, left) + 'px, ' +
            Math.max(0, (top - $(window).scrollTop())) + 'px, 0)" src="' +
            ($it.attr('src').split('?imageView2')[0]) +
            '" onload="Article.previewImgAfterLoading()"></div>')

        $('.img-preview').css({
          'background-color': '#fff',
          'position': 'fixed',
        })
      }, 100)
    })

    // UA
    var ua = $('#articltVia').data('ua'),
      name = Util.getDeviceByUa(ua)
    if (name !== '') {
      $('#articltVia').text('via ' + name)
    }

    // his
    $('#revision').dialog({
      'width': $(window).width() > 500 ? 500 : $(window).width() - 50,
      'height': $(window).height() - 50,
      'modal': true,
      'hideFooter': true,
    })

    // report
    $('#reportDialog').dialog({
      'width': $(window).width() > 500 ? 500 : $(window).width() - 50,
      'height': 450,
      'modal': true,
      'hideFooter': true,
    })

    this.initAudio()

    // scroll
    $(window).scroll(function () {
      var currentScrollTop = $(window).scrollTop()

      // share
      if (currentScrollTop > -1 &&
        currentScrollTop < $('.article .article-body').outerHeight() - 48) {
        $('.share').show()
      } else {
        $('.share').hide()
      }

      if (currentScrollTop < $('.article-title').offset().top) {
        $('.article-header').css('top', '-50px')
        $('.nav').show()
      } else {
        $('.article-header').css('top', '0')
        $('.nav').hide()
      }
    })

//        $(window).on('mousewheel DOMMouseScroll', function(e){
//            var currentScrollTop = $(window).scrollTop();
//            if (currentScrollTop < 150) {
//                $('.article-header').css('top', '-48px');
//                return;
//            }
//
//            var eo = e.originalEvent;
//            var xy = eo.wheelDelta || -eo.detail; //shortest possible code
//            var y = eo.wheelDeltaY || (eo.axis === 2 ? xy : 0); // () necessary!
//
//            if (y < 0 && currentScrollTop >= 150) {
//                $('.article-header').css('top', 0);
//            } else if (y > 0) {
//                $('.article-header').css('top', '-48px');
//            }
//
//        });

    // nav
//        window.addEventListener('mousewheel', function(event) {
//            var currentScrollTop = $(window).scrollTop();
//            if (currentScrollTop < 150) {
//                $('.article-header').css('top', '-48px');
//                return false;
//            }
//
//            if (event.deltaY > 0 && currentScrollTop >= 150) {
//                $('.article-header').css('top', 0);
//            } else if (event.deltaY < -5) {
//                $('.article-header').css('top', '-48px');
//            }
//        }, false);

    $(window).resize(function () {
      var shareL = parseInt($('.article-footer').css('margin-left')) / 2 - 15
      $('.share').css('left', (shareL < 0 ? 0 : shareL) + 'px')

      $('#articleToC > .module-panel').height($(window).height() - 48)

      if ($(window).width() < 1024) {
        $('.article-header > h2').removeAttr('style')
        if ($('#articleToC').length === 0) {
          return false
        }
        $('.article-body .wrapper, #articleCommentsPanel, .article-footer').
          css('margin-right', 'auto')
        return false
      }

      if ($('#articleToC').length === 1) {
        var articleToCW = $('#articleToC').width(),
          articleMR = ($(window).width() - articleToCW -
            $('.article-info').width() - 30) / 3 + articleToCW
        $('.article-body .wrapper, #articleCommentsPanel, .article-footer').
          css('margin-right', articleMR + 'px')
      }
      $('.article-header > h2').
        css('margin-left', Math.max(20,
          ($('.article-footer').offset().left - 58)) + 'px')
    })

    // set session storage
    var searchQuery = location.search.split('r=')[1]
    if (searchQuery) {
      sessionStorage.setItem('r', searchQuery.split('&')[0])
    }
  },
  /**
   * \u5386\u53f2\u7248\u672c\u5bf9\u6bd4
   * @param {string} id \u6587\u7ae0/\u8bc4\u8bba id
   * @param {string} type \u7c7b\u578b[comment, article]
   * @returns {undefined}
   */
  revision: function (id, type) {
    if (!Label.isLoggedIn) {
      Util.needLogin()
      return false
    }
    if (!type) {
      type = 'article'
    }

    $.ajax({
      url: Label.servePath + '/' + type + '/' + id + '/revisions',
      cache: false,
      success: function (result, textStatus) {
        if (result.sc) {
          if (0 === result.revisions.length // for legacy data
            || 1 === result.revisions.length) {
            $('#revision > .revisions').remove()
            $('#revisions').html('<b>' + Label.noRevisionLabel + '</b>')
            return false
          }

          // clear data
          $('#revisions').html('').prev().remove()

          $('#revisions').
            data('revisions', result.revisions).
            before('<div class="revisions">' +
              '<a href="javascript:void(0)" class="first"><svg><use xlink:href="#chevron-left"</svg></a><span>' +
              (result.revisions.length - 1) + '~' + result.revisions.length +
              '/' +
              result.revisions.length +
              '</span><a href="javascript:void(0)" class="disabled last"><svg><use xlink:href="#chevron-right"</svg></a>' +
              '</div>')
          if (result.revisions.length <= 2) {
            $('#revision a').first().addClass('disabled')
          }

          var diff = JsDiff.createPatch('',
            result.revisions[result.revisions.length -
            2].revisionData.articleContent ||
            result.revisions[result.revisions.length -
            2].revisionData.commentContent,
            result.revisions[result.revisions.length -
            1].revisionData.articleContent ||
            result.revisions[result.revisions.length -
            1].revisionData.commentContent,
            result.revisions[result.revisions.length -
            2].revisionData.articleTitle || '',
            result.revisions[result.revisions.length -
            1].revisionData.articleTitle || '')

          var diff2htmlUi = new Diff2HtmlUI({diff: diff})
          diff2htmlUi.draw('#revisions', {
            matching: 'lines',
            outputFormat: 'side-by-side',
            synchronisedScroll: true,
          })
          Article._revisionsControls(type)
          return false
        }

        Util.alert(result.msg)
      },
    })
    $('#revision').dialog('open')
  },
  /**
   * \u4e0a\u4e00\u7248\u672c\uff0c\u4e0b\u4e00\u7248\u672c\u5bf9\u6bd4
   * @returns {undefined}
   */
  _revisionsControls: function (type) {
    var revisions = $('#revisions').data('revisions')
    $('#revision a.first').click(function () {
      if ($(this).hasClass('disabled')) {
        return
      }

      var prevVersion = parseInt(
        $('#revision .revisions').text().split('~')[0])
      if (prevVersion <= 2) {
        $(this).addClass('disabled')
      } else {
        $(this).removeClass('disabled')
      }

      if (revisions.length > 2) {
        $('#revision a.last').removeClass('disabled')
      }

      $('#revision .revisions > span').
        html((prevVersion - 1) + '~' + prevVersion + '/' + revisions.length)

      var diff = JsDiff.createPatch('',
        revisions[prevVersion - 2].revisionData.articleContent ||
        revisions[prevVersion - 2].revisionData.commentContent,
        revisions[prevVersion - 1].revisionData.articleContent ||
        revisions[prevVersion - 1].revisionData.commentContent,
        revisions[prevVersion - 2].revisionData.articleTitle || '',
        revisions[prevVersion - 1].revisionData.articleTitle || '')

      var diff2htmlUi = new Diff2HtmlUI({diff: diff})
      diff2htmlUi.draw('#revisions', {
        matching: 'lines',
        outputFormat: 'side-by-side',
        synchronisedScroll: true,
      })
    })

    $('#revision a.last').click(function () {
      if ($(this).hasClass('disabled')) {
        return
      }

      var prevVersion = parseInt(
        $('#revision .revisions span').text().split('~')[0])
      if (prevVersion > revisions.length - 3) {
        $(this).addClass('disabled')
      } else {
        $(this).removeClass('disabled')
      }

      if (revisions.length > 2) {
        $('#revision a.first').removeClass('disabled')
      }

      $('#revision .revisions > span').
        html((prevVersion + 1) + '~' + (prevVersion + 2) + '/' +
          revisions.length)

      var diff = JsDiff.createPatch('',
        revisions[prevVersion].revisionData.articleContent ||
        revisions[prevVersion].revisionData.commentContent,
        revisions[prevVersion + 1].revisionData.articleContent ||
        revisions[prevVersion + 1].revisionData.commentContent,
        revisions[prevVersion].revisionData.articleTitle || '',
        revisions[prevVersion + 1].revisionData.articleTitle || '')

      var diff2htmlUi = new Diff2HtmlUI({diff: diff})
      diff2htmlUi.draw('#revisions', {
        matching: 'lines',
        outputFormat: 'side-by-side',
        synchronisedScroll: true,
      })
    })
  },
  /**
   * @description \u5206\u4eab\u6309\u94ae
   */
  share: function () {
    var shareL = parseInt($('.article-footer').css('margin-left')) / 2 - 15
    $('.share').css('left', (shareL < 20 ? 20 : shareL) + 'px')

    var shareURL = $('#qrCode').data('shareurl')
    $('#qrCode').qrcode({
      width: 90,
      height: 90,
      text: shareURL,
    })

    $('body').click(function () {
      $('#qrCode').slideUp()
    })

    $('.share > span').click(function () {
      var key = $(this).data('type')
      if (!key) return false
      if (key === 'wechat') {
        $('#qrCode').slideToggle()
        return false
      }

      if (key === 'copy') {
        return false
      }

      var title = encodeURIComponent(Label.articleTitle + ' - ' +
        Label.symphonyLabel),
        url = encodeURIComponent(shareURL),
        picCSS = $('.article-info .avatar-mid').css('background-image')
      pic = picCSS.substring(5, picCSS.length - 2)

      var urls = {}
      urls.tencent = 'http://share.v.t.qq.com/index.php?c=share&a=index&title=' +
        title +
        '&url=' + url + '&pic=' + pic
      urls.weibo = 'http://v.t.sina.com.cn/share/share.php?title=' +
        title + '&url=' + url + '&pic=' + pic
      urls.google = 'https://plus.google.com/share?url=' + url
      urls.twitter = 'https://twitter.com/intent/tweet?status=' + title + ' ' +
        url
      window.open(urls[key], '_blank', 'top=100,left=200,width=648,height=618')
    })

    $('#qrCode').click(function () {
      $(this).hide()
    })

    $('#shareClipboard').mouseover(function () {
      $(this).attr('aria-label', Label.copyLabel)
    })
    Util.clipboard($('#shareClipboard'), $('#shareClipboard').next(),
      function () {
        $('#shareClipboard').attr('aria-label', Label.copiedLabel)
      })
  },
  /*
   * @description \u89e3\u6790\u8bed\u6cd5\u9ad8\u4eae
   */
  parseLanguage: function () {
    if (Label.markedAvailable) {
      return
    }
    $('pre code').each(function (i, block) {
      $(this).css('max-height', $(window).height() - 68)
      hljs.highlightBlock(block)
    })
  },
  /**
   * @description \u6253\u8d4f
   */
  reward: function (articleId) {
    var r = confirm(Label.rewardConfirmLabel)

    if (r) {
      $.ajax({
        url: Label.servePath + '/article/reward?articleId=' + articleId,
        type: 'POST',
        cache: false,
        success: function (result, textStatus) {
          if (result.sc) {
            $('#articleRewardContent .content-reset').
              html(result.articleRewardContent)
            Article.parseLanguage()

            var $rewarcCnt = $('#articleRewardContent > span'),
              cnt = parseInt($rewarcCnt.text())
            $rewarcCnt.addClass('ft-red').
              removeClass('ft-blue').
              html((cnt + 1) + ' ' + Label.rewardLabel).
              removeAttr('onclick')
            return
          }

          Util.alert(result.msg)
        },
        error: function (result) {
          Util.needLogin()
        },
      })
    }
  },
  /**
   * @description \u611f\u8c22\u6587\u7ae0
   */
  thankArticle: function (articleId, articleAnonymous) {
    if (!Label.isLoggedIn) {
      Util.needLogin()
      return false
    }

    // \u533f\u540d\u8d34\u4e0d\u9700\u8981 confirm
    if (0 === articleAnonymous && !confirm(Label.thankArticleConfirmLabel)) {
      return false
    }

    if (Label.currentUserName === Label.articleAuthorName) {
      Util.alert(Label.thankSelfLabel)
      return false
    }

    $.ajax({
      url: Label.servePath + '/article/thank?articleId=' + articleId,
      type: 'POST',
      cache: false,
      success: function (result, textStatus) {
        if (result.sc) {
          var thxCnt = parseInt($('#thankArticle').text())
          $('#thankArticle').
            removeAttr('onclick').
            html('<svg><use xlink:href="#heart"></use></svg><span class="ft-13">' +
              (thxCnt + 1) + '</span>').
            addClass('ft-red').
            removeClass('ft-blue')

          var $heart = $(
            '<svg class="ft-red"><use xlink:href="#heart"></use></svg>'),
            y = $('#thankArticle').offset().top,
            x = $('#thankArticle').offset().left
          $heart.css({
            'z-index': 9999,
            'top': y - 20,
            'left': x,
            'position': 'absolute',
            'font-size': 16,
            '-moz-user-select': 'none',
            '-webkit-user-select': 'none',
            '-ms-user-select': 'none',
          })
          $('body').append($heart)

          $heart.animate({'top': y - 180, 'opacity': 0},
            1500,
            function () {
              $heart.remove()
            }
          )

          return false
        }

        Util.alert(result.msg)
      },
    })
  },
  /**
   * @description \u7f6e\u9876
   */
  stick: function (articleId) {
    var r = confirm(Label.stickConfirmLabel)

    if (r) {
      $.ajax({
        url: Label.servePath + '/article/stick?articleId=' + articleId,
        type: 'POST',
        cache: false,
        success: function (result, textStatus) {
          Util.alert(result.msg)

          window.location.href = Label.servePath + '/recent'
        },
      })
    }
  },
  /**
   * @description \u64ad\u653e\u601d\u7eea
   * @param {string} articleContent \u8bb0\u5f55\u8fc7\u7a0b
   */
  playThought: function (articleContent) {
    // - 0x1E: Record Separator (\u8bb0\u5f55\u5206\u9694\u7b26)
    // + 0x1F: Unit Separator (\u5355\u5143\u5206\u9694\u7b26)

    var fast = 2
    var genThought = function (record, articleLinesList) {
      var units = record.split('\x1f')
      if (units.length === 3) {
        units.splice(0, 0, '')
      }
      var srcLinesContent = units[0],
        from = units[2].split('-'),
        to = units[3].split('-')
      from[0] = parseInt(from[0])    // from.ch
      from[1] = parseInt(from[1])    // from.line
      to[0] = parseInt(to[0])    // to.ch
      to[1] = parseInt(to[1])    // to.line

      if (srcLinesContent === '\x18') {
        // remove
        var removeLines = []
        for (var n = from[1], m = 0; n <= to[1], n <
        articleLinesList.length; n++, m++) {
          if (from[1] === to[1]) {
            articleLinesList[n] = articleLinesList[n].substring(0, from[0]) +
              articleLinesList[n].substr(to[0])
            break
          }

          if (n === from[1]) {
            articleLinesList[n] = articleLinesList[n].substr(0, from[0])
          } else if (n === to[1]) {
            articleLinesList[from[1]] += articleLinesList[n].substr(to[0])
            articleLinesList.splice(n, 1)
          } else {
            removeLines.push(n)
          }
        }
        for (var o = 0; o < removeLines.length; o++) {
          articleLinesList.splice(removeLines[o] - o, 1)
        }
      } else {
        var addLines = srcLinesContent.split(String.fromCharCode(29))[0],
          removedLines = srcLinesContent.split(String.fromCharCode(29))[1]

        if (removedLines === '') {
          articleLinesList[from[1]] = articleLinesList[from[1]].substring(0,
            from[0]) +
            articleLinesList[to[1]].substr(to[0])
        }

        articleLinesList[from[1]] = articleLinesList[from[1]].substring(0,
          from[0]) + addLines
          + articleLinesList[from[1]].substr(from[0])
      }
      return articleLinesList
    }

    var records = articleContent.split('\x1e')

    // \u5206\u9694\u7b26\u540e\u7684''\u5220\u9664
    if (records[records.length - 1] === '') {
      records.pop()
    }
    for (var i = 0, j = 0; i < records.length; i++) {
      setTimeout(function () {
        if (!$('.article-content').data('text')) {
          $('.article-content').data('text', '')
        }

        var articleLinesList = genThought(records[j++],
          $('.article-content').data('text').split(String.fromCharCode(10)))

        var articleText = articleLinesList.join(String.fromCharCode(10))
        var articleHTML = articleText.replace(/\n/g, '<br>').
          replace(/ /g, '&nbsp;').
          replace(/	/g, '&nbsp;&nbsp;&nbsp;&nbsp;')

        $('.article-content').data('text', articleText).html(articleHTML)

      }, parseInt(records[i].split('\x1f')[1]) / fast)
    }

    // progress
    var currentTime = 0,
      step = 20, // \u95f4\u9694\u901f\u5ea6
      amountTime = parseInt(records[i - 1].split('\x1f')[1]) / fast + step * 6
    var interval = setInterval(function () {
      if (currentTime >= amountTime) {
        $('#thoughtProgress .bar').width('100%')
        $('#thoughtProgress .icon-video').css('left', '100%')
        clearInterval(interval)
      } else {
        currentTime += step
        $('#thoughtProgress .icon-video').
          css('left', (currentTime * 100 / amountTime) + '%')
        $('#thoughtProgress .bar').
          width((currentTime * 100 / amountTime) + '%')
      }

    }, step)

    // preview
    for (var v = 0, k = 0; v < records.length; v++) {
      var articleLinesList = genThought(records[k++],
        $('#thoughtProgressPreview').
          data('text').
          split(String.fromCharCode(10)))

      var articleText = articleLinesList.join(String.fromCharCode(10))
      var articleHTML = articleText.replace(/\n/g, '<br>').
        replace(/ /g, '&nbsp;').
        replace(/	/g, '&nbsp;&nbsp;&nbsp;&nbsp;')

      $('#thoughtProgressPreview').data('text', articleText).html(articleHTML)
    }
    $('#thoughtProgressPreview').dialog({
      'modal': true,
      'hideFooter': true,
    })
    $('#thoughtProgress .icon-video').click(function () {
      $('#thoughtProgressPreview').dialog('open')
    })

    // set default height
    $('.article-content').
      html(articleHTML).
      height($('.article-content').height()).
      html('')
  },
  /**
   * @description \u521d\u59cb\u5316\u76ee\u5f55.
   */
  initToc: function () {
    if ($('#articleToC').length === 0) {
      $('.article-header > h2').
        css('margin-left', Math.max(20,
          ($('.article-footer').offset().left - 58)) + 'px')
      $('.article-body .wrapper, #articleCommentsPanel, .article-footer').
        css('margin-right', 'auto')
      return false
    }

    var articleToCW = $('#articleToC').width(),
      articleMR = ($(window).width() - articleToCW -
        $('.article-info').width() - 30) / 3 + articleToCW
    $('.article-body .wrapper, #articleCommentsPanel, .article-footer').
      css('margin-right', articleMR + 'px')

    $('.article-header > h2').
      css('margin-left', Math.max(20,
        ($('.article-footer').offset().left - 58)) + 'px')
    $('#articleToC > .module-panel').height($(window).height() - 48)

    // \u6837\u5f0f
    var $articleToc = $('#articleToC'),
      $articleTocUl = $('.article-toc'),
      $articleTocs = $('.article-content [id^=toc]'),
      isUlScroll = false,
      top = $articleToc.offset().top
    toc = []

    // \u76ee\u5f55\u70b9\u51fb
    $articleToc.find('li').click(function () {
      var $it = $(this)
      setTimeout(function () {
        $articleToc.find('li').removeClass('current')
        $it.addClass('current')
      }, 50)
    })

    $(window).scroll(function (event) {
      if (parseInt($('#articleToC').css('right')) < 0) {
        return false
      }
      $('#articleToC > .module-panel').height($(window).height() - 49)

      // \u754c\u9762\u5404\u79cd\u56fe\u7247\u52a0\u8f7d\u4f1a\u5bfc\u81f4\u5e16\u5b50\u76ee\u5f55\u5b9a\u4f4d
      toc = []
      $articleTocs.each(function (i) {
        toc.push({
          id: this.id,
          offsetTop: this.offsetTop,
        })
      })

      // \u5f53\u524d\u76ee\u5f55\u6837\u5f0f
      var scrollTop = $(window).scrollTop()
      for (var i = 0, iMax = toc.length; i < iMax; i++) {
        if (scrollTop < toc[i].offsetTop - 53) {
          $articleToc.find('li').removeClass('current')
          var index = i > 0 ? i - 1 : 0
          $articleToc.find('a[data-id="' + toc[index].id + '"]').
            parent().
            addClass('current')
          break
        }
      }
      if (scrollTop >= toc[toc.length - 1].offsetTop - 53) {
        $articleToc.find('li').removeClass('current')
        $articleToc.find('li:last').addClass('current')
      }

      // auto scroll to current toc
      var liOffsetTop = $articleToc.find('li.current')[0].offsetTop
      if (!isUlScroll) {
        // down scroll
        if ($articleTocUl.scrollTop() < liOffsetTop - $articleTocUl.height() +
          30) {
          $articleTocUl.scrollTop(liOffsetTop - $articleTocUl.height() + 30)
        }
        // up scroll
        if ($articleTocUl.scrollTop() > liOffsetTop - 30) {
          $articleTocUl.scrollTop(liOffsetTop)
        }
      }
      // \u5728\u76ee\u5f55\u4e0a\u6eda\u52a8\u5230\u8fb9\u754c\u65f6\uff0c\u4f1a\u6eda\u52a8 window\uff0c\u4e3a\u4e86\u4e0d\u8ba9 window \u6eda\u52a8\u89e6\u53d1\u76ee\u5f55\u6eda\u52a8\u3002
      setTimeout(function () {
        isUlScroll = false
      }, 600)
    })

    $(window).scroll()

    $articleTocUl.scrollTop($articleToc.find('li.current')[0].offsetTop).
      scroll(function () {
        isUlScroll = true
      })
  },
  /**
   * @description \u76ee\u5f55\u5c55\u73b0\u9690\u85cf\u5207\u6362.
   */
  toggleToc: function () {
    var $articleToc = $('#articleToC')
    if ($articleToc.length === 0) {
      return false
    }

    var $menu = $('.article-header .icon-unordered-list')
    if ($menu.hasClass('ft-red')) {
      $articleToc.animate({
        right: '-' + $('#articleToC').outerWidth() + 'px',
      })
      $menu.removeClass('ft-red')
      $('.article-actions  .icon-unordered-list').removeClass('ft-red')
    } else {
      $articleToc.animate({
        right: 0,
      })
      $menu.addClass('ft-red')
      $('.article-actions  .icon-unordered-list').addClass('ft-red')
    }
  },
  /**
   * @description \u6807\u8bb0\u6d88\u606f\u901a\u77e5\u4e3a\u5df2\u8bfb\u72b6\u6001.
   */
  makeNotificationRead: function (articleId, commentIds) {
    var requestJSONObject = {
      articleId: articleId,
      commentIds: commentIds,
    }

    $.ajax({
      url: Label.servePath + '/notification/read',
      type: 'POST',
      cache: false,
      data: JSON.stringify(requestJSONObject),
    })
  },
}

Article.init()

$(document).ready(function () {
  Comment.init()
  // jQuery File Upload
  Util.uploadFile({
    'type': 'img',
    'id': 'fileUpload',
    'pasteZone': $('.CodeMirror'),
    'qiniuUploadToken': Label.qiniuUploadToken,
    'editor': Comment.editor,
    'uploadingLabel': Label.uploadingLabel,
    'qiniuDomain': Label.qiniuDomain,
    'imgMaxSize': Label.imgMaxSize,
    'fileMaxSize': Label.fileMaxSize,
  })

  // Init [Article] channel
  ArticleChannel.init(Label.articleChannel)

  // make notification read
  if (Label.isLoggedIn) {
    Article.makeNotificationRead(Label.articleOId, Label.notificationCmtIds)

    setTimeout(function () {
      Util.setUnreadNotificationCount()
    }, 1000)
  }
})