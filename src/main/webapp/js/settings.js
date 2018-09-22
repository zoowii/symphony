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
 * @fileoverview settings.
 *
 * @author <a href="http://vanessa.b3log.org">Liyuan Li</a>
 * @author <a href="http://88250.b3log.org">Liang Ding</a>
 * @author <a href="http://zephyr.b3log.org">Zephyr</a>
 * @version 1.26.0.5, Aug 29, 2018
 */

/**
 * @description Settings function
 * @static
 */
var Settings = {
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
        reportDataType: 2,
        reportType: $('input[name=report]:checked').val(),
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
   * \u83b7\u53d6\u90ae\u7bb1\u9a8c\u8bc1\u7801
   * @param csrfToken
   */
  getEmailCaptcha: function (csrfToken) {
    $('#emailGetBtn').attr('disabled', 'disabled').css('opacity', '0.3')
    $.ajax({
      url: Label.servePath + '/settings/email/vc',
      type: 'POST',
      headers: {'csrfToken': csrfToken},
      data: JSON.stringify({
        userEmail: $('#emailInput').val(),
        captcha: $('#emailVerify').val(),
      }),
      success: function (result) {
        if (result.sc) {
          $('#emailInput').prop('disabled', true)
          $('.home-account__captch').hide()
          $('#emailCodePanel').show()
          $('#emailCode').show().focus()
          $('#emailSubmitBtn').show()
          $('#emailGetBtn').hide()
        }
        Util.alert(result.msg)
        $('#emailGetBtn').removeAttr('disabled').css('opacity', '1')
      },
    })
  },
  /**
   * \u66f4\u65b0\u90ae\u7bb1
   */
  updateEmail: function (csrfToken) {
    $('#emailSubmitBtn').attr('disabled', 'disabled').css('opacity', '0.3')
    $.ajax({
      url: Label.servePath + '/settings/email',
      type: 'POST',
      headers: {'csrfToken': csrfToken},
      data: JSON.stringify({
        userEmail: $('#emailInput').val(),
        captcha: $('#emailCode').val(),
      }),
      success: function (result) {
        if (result.sc) {
          $('.home-account__captch').show()
          $('#emailVerify').val('')
          $('#emailCodePanel').hide()
          $('#emailCode').val('')
          $('#emailSubmitBtn').hide()
          $('#emailGetBtn').show()
          $('#emailInput').prop('disabled', false)
          $('.home-account__captch img').click()
          Util.alert(Label.updateSuccLabel)
        } else {
          if (result.code === 1) {
            $('.home-account__captch').show()
            $('#emailVerify').val('')
            $('#emailCodePanel').hide()
            $('#emailCodePanel').hide()
            $('#emailSubmitBtn').hide()
            $('#emailGetBtn').show()
            $('#emailInput').prop('disabled', false)
            $('.home-account__captch img').click()
          }
          Util.alert(result.msg)
        }
        $('#emailSubmitBtn').removeAttr('disabled').css('opacity', '1')
      },
    })
  },
  /**
   * \u4e2a\u4eba\u4e3b\u9875\u6eda\u52a8\u56fa\u5b9a
   */
  homeScroll: function () {
    $('.nav-tabs').html($('.home-menu').html());
    $('.nav').css({
      'position': 'fixed',
      'box-shadow': '0 1px 2px rgba(0,0,0,.2)'
    });
    $('.main').css('paddingTop', '68px');
  },
  /**
   * \u901a\u77e5\u9875\u9762\u4fa7\u8fb9\u680f\u6eda\u52a8\u56fa\u5b9a
   */
  notiScroll: function () {
    var $side = $('#side'),
      width = $side.width(),
      maxScroll = $('.small-tips').closest('.module').length === 1 ? 109 + $('.small-tips').closest('.module').height() : 89;
    $('.side.fn-none').height($side.height());
    $(window).scroll(function () {
      if ($(window).scrollTop() > maxScroll) {
        $side.css({
          position: 'fixed',
          width: width + 'px',
          top: 0,
          right: $('.wrapper').css('margin-right')
        });

        $('.side.fn-none').show();
        $('.small-tips').closest('.module').hide();
      } else {
        $side.removeAttr('style');

        $('.side.fn-none').hide();
        $('.small-tips').closest('.module').show();
      }
    });
  },
  /**
   * \u6709\u4ee3\u7801\u7247\u6bb5\u65f6\uff0c\u9700\u8981\u8fdb\u884c\u9ad8\u4eae
   * @returns {Boolean}
   */
  initHljs: function () {
    if ($('pre code').length === 0 || Label.markedAvailable) {
      return false;
    }
    $.ajax({
      method: "GET",
      url: Label.servePath + "/js/lib/highlight/highlight.pack.js",
      dataType: "script"
    }).done(function () {
      $('pre code').each(function (i, block) {
        hljs.highlightBlock(block);
        $(this).css('max-height', $(window).height() - 68);
      });
    });
  },
  /**
   * \u4e2a\u4eba\u8bbe\u7f6e\u9884\u89c8
   */
  preview: function (it) {
    if ($('#homeSidePanel').css('display') === 'block') {
      $('#homeSidePanel').hide();
      $(it).text(Label.previewLabel);
    } else {
      $('#homeSidePanel').show();
      $('#userNicknameDom').text($('#userNickname').val());
      $('#userTagsDom').text($('#userTags').val());
      $('#userURLDom').text($('#userURL').val()).attr('href', $('#userURL').val());
      $('#userIntroDom').text($('#userIntro').val());

      $(it).text(Label.unPreviewLabel);
    }
  },
  /**
   * \u521d\u59cb\u5316\u4e2a\u4eba\u8bbe\u7f6e\u4e2d\u7684\u5934\u50cf\u56fe\u7247\u4e0a\u4f20.
   *
   * @returns {Boolean}
   */
  initUploadAvatar: function (params, succCB, succCBQN) {
    var ext = "";
    if ("" === params.qiniuUploadToken) { // \u8bf4\u660e\u6ca1\u6709\u4f7f\u7528\u4e03\u725b\uff0c\u800c\u662f\u4f7f\u7528\u672c\u5730
      $('#' + params.id).fileupload({
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxFileSize: parseInt(params.maxSize),
        multipart: true,
        pasteZone: null,
        dropZone: null,
        url: Label.servePath + "/upload",
        add: function (e, data) {
          ext = data.files[0].type.split("/")[1];

          if (window.File && window.FileReader && window.FileList && window.Blob) {
            var reader = new FileReader();
            reader.readAsArrayBuffer(data.files[0]);
            reader.onload = function (evt) {
              var fileBuf = new Uint8Array(evt.target.result.slice(0, 11));
              var isImg = isImage(fileBuf);

              if (!isImg) {
                Util.alert("Image only~");

                return;
              }

              if (evt.target.result.byteLength > 1024 * 1024) {
                Util.alert("This image is too large (max 1M)");

                return;
              }

              data.submit();
            };
          } else {
            data.submit();
          }
        },
        formData: function (form) {
          var data = form.serializeArray();
          return data;
        },
        submit: function (e, data) {
        },
        done: function (e, data) {
          var qiniuKey = data.result.key;
          if (!qiniuKey) {
            Util.alert("Upload error");
            return;
          }

          succCB(data);
        },
        fail: function (e, data) {
          Util.alert("Upload error: " + data.errorThrown);
        }
      }).on('fileuploadprocessalways', function (e, data) {
        var currentFile = data.files[data.index];
        if (data.files.error && currentFile.error) {
          Util.alert(currentFile.error);
        }
      });
    } else {
      $('#' + params.id).fileupload({
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxFileSize: parseInt(params.maxSize),
        multipart: true,
        pasteZone: null,
        dropZone: null,
        url: "https://up.qbox.me/",
        add: function (e, data) {
          ext = data.files[0].type.split("/")[1];

          if (window.File && window.FileReader && window.FileList && window.Blob) {
            var reader = new FileReader();
            reader.readAsArrayBuffer(data.files[0]);
            reader.onload = function (evt) {
              var fileBuf = new Uint8Array(evt.target.result.slice(0, 11));
              var isImg = isImage(fileBuf);

              if (!isImg) {
                Util.alert("Image only~");

                return;
              }

              if (evt.target.result.byteLength > 1024 * 1024) {
                Util.alert("This image is too large (max 1M)");

                return;
              }

              data.submit();
            };
          } else {
            data.submit();
          }
        },
        formData: function (form) {
          var data = form.serializeArray();
          data.push({name: 'token', value: params.qiniuUploadToken});
          data.push({name: 'key', value: 'avatar/' + params.userId + "_" + new Date().getTime() + "." + ext});

          console.log(data);

          return data;
        },
        submit: function (e, data) {
        },
        done: function (e, data) {
          var qiniuKey = data.result.key;
          if (!qiniuKey) {
            Util.alert("Upload error");
            return;
          }

          succCBQN(data);
        },
        fail: function (e, data) {
          Util.alert("Upload error: " + data.errorThrown);
        }
      }).on('fileuploadprocessalways', function (e, data) {
        var currentFile = data.files[data.index];
        if (data.files.error && currentFile.error) {
          Util.alert(currentFile.error);
        }
      });
    }
  },
  /**
   * \u6570\u636e\u5bfc\u51fa.
   */
  exportPosts: function () {
    $.ajax({
      url: Label.servePath + "/export/posts",
      type: "POST",
      cache: false,
      success: function (result, textStatus) {
        if (!result.sc) {
          Util.alert("TBD: V, tip display it....");

          return;
        }

        window.open(result.url);
      }
    });
  },
  /**
   * @description \u4fee\u6539\u5730\u7406\u4f4d\u7f6e\u72b6\u6001
   * @param {type} csrfToken CSRF token
   */
  changeGeoStatus: function (csrfToken) {
    var requestJSONObject = {
      "userGeoStatus": $('#geoStatus').val()
    };

    $.ajax({
      url: Label.servePath + "/settings/geo/status",
      type: "POST",
      headers: {"csrfToken": csrfToken},
      cache: false,
      data: JSON.stringify(requestJSONObject),
      success: function (result, textStatus) {
        console.log(result);
      }
    });
  },
  /**
   * @description \u79ef\u5206\u8f6c\u8d26
   * @argument {String} csrfToken CSRF token
   */
  pointTransfer: function (csrfToken) {
    if (Validate.goValidate({
      target: $('#pointTransferTip'),
      data: [{
        "target": $("#pointTransferUserName"),
        "type": "string",
        "max": 256,
        "msg": Label.invalidUserNameLabel
      }, {
        "target": $("#pointTransferAmount"),
        "type": "string",
        'max': 50,
        "msg": Label.amountNotEmpty
      }]
    })) {
      var requestJSONObject = {
        "userName": $("#pointTransferUserName").val(),
        "amount": $("#pointTransferAmount").val()
      };

      $.ajax({
        url: Label.servePath + "/point/transfer",
        type: "POST",
        headers: {"csrfToken": csrfToken},
        cache: false,
        data: JSON.stringify(requestJSONObject),
        beforeSend: function () {
          $("#pointTransferTip").removeClass("succ").removeClass("error").html("");
        },
        error: function (jqXHR, textStatus, errorThrown) {
          Util.alert(errorThrown);
        },
        success: function (result, textStatus) {
          if (result.sc) {
            $("#pointTransferTip").addClass("succ").removeClass("error").html('<ul><li>' + Label.transferSuccLabel + '</li></ul>');
            $("#pointTransferUserName").val('');
            $("#pointTransferAmount").val('');
          } else {
            $("#pointTransferTip").addClass("error").removeClass("succ").html('<ul><li>' + result.msg + '</li></ul>');
          }

          $("#pointTransferTip").show();

          setTimeout(function () {
            $("#pointTransferTip").hide();
          }, 2000);
        }
      });
    }
  },
  /**
   * @description \u79ef\u5206\u5151\u6362\u9080\u8bf7\u7801
   * @argument {String} csrfToken CSRF token
   */
  pointBuyInvitecode: function (csrfToken) {
    var requestJSONObject = {};

    $.ajax({
      url: Label.servePath + "/point/buy-invitecode",
      type: "POST",
      headers: {"csrfToken": csrfToken},
      cache: false,
      data: JSON.stringify(requestJSONObject),
      beforeSend: function () {
        $("#pointBuyInvitecodeTip").removeClass("succ").removeClass("error").html("");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        Util.alert(errorThrown);
      },
      success: function (result, textStatus) {
        if (result.sc) {
          $(".list ul").prepend('<li class="content-reset"><code>' + result.msg.split(' ')[0] + '</code>' + result.msg.substr(16) + '</li>');
        } else {
          $("#pointBuyInvitecodeTip").addClass("error").removeClass("succ").html('<ul><li>' + result.msg + '</li></ul>');
        }
        $("#pointBuyInvitecodeTip").show();
      }
    });
  },
  /**
   * @description \u67e5\u8be2\u9080\u8bf7\u7801\u72b6\u6001
   * @param {String} csrfToken CSRF token
   * @returns {undefined}
   */
  queryInvitecode: function (csrfToken) {
    var requestJSONObject = {
      invitecode: $('#invitecode').val()
    };

    $.ajax({
      url: Label.servePath + "/invitecode/state",
      type: "POST",
      headers: {"csrfToken": csrfToken},
      cache: false,
      data: JSON.stringify(requestJSONObject),
      beforeSend: function () {
        $("#invitecodeStateTip").removeClass("succ").removeClass("error").html("");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        Util.alert(errorThrown);
      },
      success: function (result, textStatus) {
        switch (result.sc) {
          case -1:
          case 0:
          case 2:
            $("#invitecodeStateTip").addClass("error").removeClass("succ").html('<ul><li>' + result.msg + '</li></ul>');

            break;
          case 1:
            $("#invitecodeStateTip").addClass("succ").removeClass("error").html('<ul><li>' + result.msg + '</li></ul>');

            break;
          default:
            $("#invitecodeStateTip").addClass("error").removeClass("succ").html('<ul><li>' + result.msg + '</li></ul>');
        }
        S
        $("#invitecodeStateTip").show();
      }
    });
  },
  /**
   * @description \u66f4\u65b0 settings \u9875\u9762\u6570\u636e.
   * @argument {String} csrfToken CSRF token
   */
  update: function (type, csrfToken) {
    var requestJSONObject = {};

    switch (type) {
      case "profiles":
        requestJSONObject = this._validateProfiles();

        break;
      case "password":
        requestJSONObject = this._validatePassword();

        break;
      case "privacy":
        requestJSONObject = {
          userArticleStatus: $("#userArticleStatus").prop("checked"),
          userCommentStatus: $("#userCommentStatus").prop("checked"),
          userFollowingUserStatus: $("#userFollowingUserStatus").prop("checked"),
          userFollowingTagStatus: $("#userFollowingTagStatus").prop("checked"),
          userFollowingArticleStatus: $("#userFollowingArticleStatus").prop("checked"),
          userWatchingArticleStatus: $("#userWatchingArticleStatus").prop("checked"),
          userFollowerStatus: $("#userFollowerStatus").prop("checked"),
          userBreezemoonStatus: $("#userBreezemoonStatus").prop("checked"),
          userPointStatus: $("#userPointStatus").prop("checked"),
          userOnlineStatus: $("#userOnlineStatus").prop("checked"),
          userJoinPointRank: $("#joinPointRank").prop("checked"),
          userJoinUsedPointRank: $("#joinUsedPointRank").prop("checked"),
          userUAStatus: $("#userUAStatus").prop("checked")
        };

        break;
      case "function":
        requestJSONObject = {
          userListPageSize: $("#userListPageSize").val(),
          userCommentViewMode: $("#userCommentViewMode").val(),
          userAvatarViewMode: $("#userAvatarViewMode").val(),
          userListViewMode: $("#userListViewMode").val(),
          userNotifyStatus: $('#userNotifyStatus').prop("checked"),
          userSubMailStatus: $('#userSubMailStatus').prop("checked"),
          userKeyboardShortcutsStatus: $('#userKeyboardShortcutsStatus').prop("checked"),
          userReplyWatchArticleStatus: $('#userReplyWatchArticleStatus').prop("checked"),
          userForwardPageStatus: $('#userForwardPageStatus').prop("checked")
        };

        break;
      case "emotionList":
        requestJSONObject = this._validateEmotionList();

        break;
      case "i18n":
        requestJSONObject = {
          userLanguage: $("#userLanguage").val(),
          userTimezone: $("#userTimezone").val()
        };

        break;
      case "username":
        requestJSONObject = {
          userName: $("#newUsername").val()
        };

        break;
      case "deactivate":
        break;
      default:
        console.log("update settings has no type");
    }

    if (!requestJSONObject) {
      return false;
    }

    $.ajax({
      url: Label.servePath + "/settings/" + type,
      type: "POST",
      headers: {"csrfToken": csrfToken},
      cache: false,
      data: JSON.stringify(requestJSONObject),
      beforeSend: function () {
        $("#" + type.replace(/\//g, "") + "Tip").removeClass("succ").removeClass("error").html("");
      },
      error: function (jqXHR, textStatus, errorThrown) {
        Util.alert(errorThrown);
      },
      success: function (result, textStatus) {
        if (result.sc) {
          $("#" + type.replace(/\//g, "") + "Tip").addClass("succ").removeClass("error")
            .html('<ul><li>' + Label.updateSuccLabel + '</li></ul>').show();
          if (type === 'profiles') {
            $('#userNicknameDom').text(requestJSONObject.userNickname);
            $('#userTagsDom').text(requestJSONObject.userTags);
            $('#userURLDom').text(requestJSONObject.userURL).attr('href', requestJSONObject.userURL);
            $('#userIntroDom').text(requestJSONObject.userIntro);

            return;
          }
        } else {
          $("#" + type.replace(/\//g, "") + "Tip").addClass("error").removeClass("succ").html('<ul><li>' + result.msg + '</li></ul>');
        }

        $("#" + type.replace(/\//g, "") + "Tip").show();

        setTimeout(function () {
          $("#" + type.replace(/\//g, "") + "Tip").hide();

          if (type === 'i18n') {
            window.location.reload();
          }

          if (type === 'deactivate') {
            window.location.href = Label.servePath;
          }
        }, 5000);
      }
    });
  },
  /**
   * @description \u9700\u8981\u5728\u4e0a\u4f20\u5b8c\u6210\u540e\u8c03\u7528\u8be5\u51fd\u6570\u6765\u66f4\u65b0\u7528\u6237\u5934\u50cf\u6570\u636e.
   * @argument {String} csrfToken CSRF token
   */
  updateAvatar: function (csrfToken) {
    var requestJSONObject = {
      userAvatarURL: $("#avatarURL").data("imageurl"),
    };

    $.ajax({
      url: Label.servePath + "/settings/avatar",
      type: "POST",
      headers: {"csrfToken": csrfToken},
      cache: false,
      data: JSON.stringify(requestJSONObject),
      beforeSend: function () {
      },
      error: function (jqXHR, textStatus, errorThrown) {
        Util.alert(errorThrown);
      },
      success: function (result, textStatus) {
        if (result.sc) {
          $('#avatarURLDom, .user-nav .avatar-small').attr('style', 'background-image:url(' + requestJSONObject.userAvatarURL + ')');
        }
      }
    });
  },
  /**
   * @description settings \u9875\u9762 profiles \u6570\u636e\u6821\u9a8c
   * @returns {boolean/obj} \u5f53\u6821\u9a8c\u4e0d\u901a\u8fc7\u65f6\u8fd4\u56de false\uff0c\u5426\u5219\u8fd4\u56de\u6821\u9a8c\u6570\u636e\u503c\u3002
   */
  _validateProfiles: function () {
    if (Validate.goValidate({
      target: $('#profilesTip'),
      data: [{
        "target": $("#userNickname"),
        "type": "string",
        "min": 0,
        "max": 20,
        "msg": Label.invalidUserNicknameLabel
      }, {
        "target": $("#userTags"),
        "type": "string",
        "min": 0,
        "max": 255,
        "msg": Label.tagsErrorLabel
      }, {
        "target": $("#userURL"),
        "type": "string",
        "min": 0,
        "max": 255,
        "msg": Label.invalidUserURLLabel
      }, {
        "target": $("#userIntro"),
        "type": "string",
        "min": 0,
        "max": 255,
        "msg": Label.invalidUserIntroLabel
      }]
    })) {
      return {
        userNickname: $("#userNickname").val().replace(/(^\s*)|(\s*$)/g, ""),
        userTags: $("#userTags").val().replace(/(^\s*)|(\s*$)/g, ""),
        userURL: $("#userURL").val().replace(/(^\s*)|(\s*$)/g, ""),
        userIntro: $("#userIntro").val().replace(/(^\s*)|(\s*$)/g, "")
      };
    } else {
      return false;
    }
  },
  /**
   * @description settings \u9875\u9762\u5bc6\u7801\u6821\u9a8c
   * @returns {boolean/obj} \u5f53\u6821\u9a8c\u4e0d\u901a\u8fc7\u65f6\u8fd4\u56de false\uff0c\u5426\u5219\u8fd4\u56de\u6821\u9a8c\u6570\u636e\u503c\u3002
   */
  _validatePassword: function () {
    var pwdVal = $("#pwdOld").val(),
      newPwdVal = $("#pwdNew").val();
    if (Validate.goValidate({
      target: $('#passwordTip'),
      data: [{
        "target": $("#pwdNew"),
        "type": "password",
        "msg": Label.invalidPasswordLabel
      }, {
        "target": $("#pwdRepeat"),
        "type": "password",
        "oranginal": $('#pwdNew'),
        "msg": Label.confirmPwdErrorLabel
      }]
    })) {
      if (newPwdVal !== $("#pwdRepeat").val()) {
        return false;
      }
      var data = {};
      data.userPassword = calcMD5(pwdVal);
      data.userNewPassword = calcMD5(newPwdVal);
      return data;
    }
    return false;
  },
  /**
   * @description settings \u9875\u9762\u8868\u60c5\u6821\u9a8c\uff08\u4e0d\u77e5\u9053\u6709\u5565\u53ef\u6821\u9a8c\u7684\uff0c\u6682\u4e0d\u505a\u6821\u9a8c\uff09
   * @returns {boolean/obj} \u5f53\u6821\u9a8c\u4e0d\u901a\u8fc7\u65f6\u8fd4\u56de false\uff0c\u5426\u5219\u8fd4\u56de\u6821\u9a8c\u6570\u636e\u503c\u3002
   */
  _validateEmotionList: function () {
    return {
      emotions: $("#emotionList").val()
    };
  },
  /**
   * @description \u6807\u8bb0\u6240\u6709\u6d88\u606f\u901a\u77e5\u4e3a\u5df2\u8bfb\u72b6\u6001.
   */
  makeAllNotificationsRead: function () {
    $.ajax({
      url: Label.servePath + "/notification/all-read",
      type: "GET",
      cache: false,
      success: function (result, textStatus) {
        if (result.sc) {
          window.location.reload();
        }
      }
    });
  },
  /**
   * @description \u5220\u9664\u6d88\u606f.
   */
  removeNotifications: function (type) {
    $.ajax({
      url: Label.servePath + '/notification/remove/' + type,
      type: 'GET',
      cache: false,
      success: function (result) {
        if (result.sc) {
          location.reload()
        }
      }
    })
    return false;
  },
  /**
   * @description \u8bbe\u7f6e\u5e38\u7528\u8868\u60c5\u70b9\u51fb\u4e8b\u4ef6\u7ed1\u5b9a.
   */
  initFunction: function () {
    $("#emojiGrid img").click(function () {
      var emoji = $(this).attr('alt');
      if ($("#emotionList").val().indexOf(emoji) !== -1) {
        return;
      }
      if ($("#emotionList").val() !== "") {
        $("#emotionList").val($("#emotionList").val() + "," + emoji);
      } else {
        $("#emotionList").val(emoji);
      }
    });
  },
  /**
   * \u4e2a\u4eba\u4e3b\u9875\u521d\u59cb\u5316
   */
  initHome: function () {
    if (Label.type === 'commentsAnonymous' || 'comments' === Label.type) {
      Settings.initHljs();
    }

    $('#reportDialog').dialog({
      'width': $(window).width() > 500 ? 500 : $(window).width() - 50,
      'height': 365,
      'modal': true,
      'hideFooter': true,
    })

    if ($.ua.device.type !== 'mobile') {
      Settings.homeScroll();
    } else {
      return
    }

    $.pjax({
      selector: 'a',
      container: '#home-pjax-container',
      show: '',
      cache: false,
      storage: true,
      titleSuffix: '',
      filter: function (href) {
        return 0 > href.indexOf(Label.servePath + '/member/' + Label.userName);
      },
      callback: function (status) {
        switch (status.type) {
          case 'success':
          case 'cache':
            $('.home-menu a').removeClass('current');
            switch (location.pathname) {
              case '/member/' + Label.userName:
              case '/member/' + Label.userName + '/comments':
                Settings.initHljs();
              case '/member/' + Label.userName + '/articles/anonymous':
              case '/member/' + Label.userName + '/comments/anonymous':
                Settings.initHljs();
                $('.home-menu a:eq(0)').addClass('current');
                break;
              case '/member/' + Label.userName + '/watching/articles':
              case '/member/' + Label.userName + '/following/users':
              case '/member/' + Label.userName + '/following/tags':
              case '/member/' + Label.userName + '/following/articles':
              case '/member/' + Label.userName + '/followers':
                $('.home-menu a:eq(1)').addClass('current');
                break;
              case '/member/' + Label.userName + '/breezemoons':
                $('.home-menu a:eq(1)').addClass('current');
                Breezemoon.init();
                break;
              case '/member/' + Label.userName + '/points':
                $('.home-menu a:eq(2)').addClass('current');
                break;
            }
          case 'error':
            break;
          case 'hash':
            break;
        }
        $('.nav-tabs').html($('.home-menu').html());
        Util.parseMarkdown();
      }
    });
    NProgress.configure({showSpinner: false});
    $('#home-pjax-container').bind('pjax.start', function () {
      NProgress.start();
    });
    $('#home-pjax-container').bind('pjax.end', function () {
      NProgress.done();
    });
  }
};