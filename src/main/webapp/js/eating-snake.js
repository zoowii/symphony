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
 * @fileOverview Eating snake game. Alexar wrote it in Love2D, Zephyr translate it into JavaScript.
 * 
 * @author Zephyr
 * @author Alexar
 * @author <a href="http://88250.b3log.org">Liang Ding</a>
 * @author zonghua
 * @version 1.1.0.2, Jul 29, 2016
 */
var EatingSnake = {
    dir: null,
    lastDir: null,
    map: null,
    food: null,
    R: 10, // \u5706\u534a\u5f84\u6216\u8005\u5916\u63a5\u6b63\u65b9\u5f62\u5c3a\u5bf8\u7684\u4e00\u534a
    size: 30,
    snake: null,
    // oMark: null, // \u5206\u6570\u663e\u793a\u6846
    isPause: false, // \u662f\u5426\u6682\u505c
    snakeCanvas: null,
    interval: null,
    currTime: 200,
    stepTime: 5,
    baseLen: 6,
    startTime: null,
    endTime: null,
    countTime: null,
    snakeColor: 0,
    appleColor: 255,
    // 1: snake
    // 0: nothing
    // 2: apple
    // 3: block
    setupMap: function () {
        for (var x = 1; x <= EatingSnake.size; x++) {
            EatingSnake.map[x] = new Array();
            for (var y = 1; y <= EatingSnake.size; y++) {
                if (x == 1 || x == EatingSnake.size || y == 1 || y == EatingSnake.size)
                    EatingSnake.map[x][y] = 3
                else
                    EatingSnake.map[x][y] = 0
            }
        }
    },
    initMap: function (snakeCanvasId) {
        // EatingSnake.oMark = document.getElementById(oMarkId);
        EatingSnake.snakeCanvas = document.getElementById(snakeCanvasId).getContext('2d');
        EatingSnake.map = new Array();
        EatingSnake.setupMap();
        if (EatingSnake.snakeCanvas != null)
            EatingSnake.snakeCanvas.clearRect(0, 0, (EatingSnake.size - 1) * 2 * EatingSnake.R, (EatingSnake.size - 1) * 2 * EatingSnake.R);
        for (var x = 1; x <= EatingSnake.size; x++) {
            for (var y = 1; y <= EatingSnake.size; y++) {
                switch (EatingSnake.map[x][y]) {
                    case 0:
                        EatingSnake.snakeCanvas.strokeStyle = "gray";
                        EatingSnake.snakeCanvas.strokeRect((x - 1) * 2 * EatingSnake.R, (y - 1) * 2 * EatingSnake.R, 2 * EatingSnake.R, 2 * EatingSnake.R);
                        break;
                    case 1:
                        EatingSnake.snakeCanvas.fillStyle = "rgb(" + EatingSnake.snakeColor + ",0,0)";
                        EatingSnake.snakeCanvas.fillRect((x - 1) * 2 * EatingSnake.R, (y - 1) * 2 * EatingSnake.R, 2 * EatingSnake.R, 2 * EatingSnake.R);
                        break;
                    case 2:
                        EatingSnake.snakeCanvas.fillStyle = "rgb(" + EatingSnake.appleColor + ",0,0)";
                        EatingSnake.snakeCanvas.fillRect((x - 1) * 2 * EatingSnake.R, (y - 1) * 2 * EatingSnake.R, 2 * EatingSnake.R, 2 * EatingSnake.R);
                        break;
                    case 3:
                        EatingSnake.snakeCanvas.fillStyle = "gray";
                        EatingSnake.snakeCanvas.fillRect((x - 1) * 2 * EatingSnake.R, (y - 1) * 2 * EatingSnake.R, 2 * EatingSnake.R, 2 * EatingSnake.R);
                        break;
                }
            }
        }
    },
    drawMap: function () {
        EatingSnake.snakeCanvas.clearRect(0, 0, (EatingSnake.size - 1) * 2 * EatingSnake.R, (EatingSnake.size - 1) * 2 * EatingSnake.R);
        for (var x = 1; x <= EatingSnake.size; x++) {
            for (var y = 1; y <= EatingSnake.size; y++) {
                switch (EatingSnake.map[x][y]) {
                    case 0:
                        EatingSnake.snakeCanvas.strokeStyle = "gray";
                        EatingSnake.snakeCanvas.strokeRect((x - 1) * 2 * EatingSnake.R, (y - 1) * 2 * EatingSnake.R, 2 * EatingSnake.R, 2 * EatingSnake.R);
                        break;
                    case 1:
                        EatingSnake.snakeCanvas.fillStyle = "black";
                        EatingSnake.snakeCanvas.fillRect((x - 1) * 2 * EatingSnake.R, (y - 1) * 2 * EatingSnake.R, 2 * EatingSnake.R, 2 * EatingSnake.R);
                        break;
                    case 2:
                        EatingSnake.snakeCanvas.fillStyle = "red";
                        EatingSnake.snakeCanvas.fillRect((x - 1) * 2 * EatingSnake.R, (y - 1) * 2 * EatingSnake.R, 2 * EatingSnake.R, 2 * EatingSnake.R);
                        break;
                    case 3:
                        EatingSnake.snakeCanvas.fillStyle = "gray";
                        EatingSnake.snakeCanvas.fillRect((x - 1) * 2 * EatingSnake.R, (y - 1) * 2 * EatingSnake.R, 2 * EatingSnake.R, 2 * EatingSnake.R);
                        break;
                }
            }
        }
    },
    check: function (x, y) {
        if (EatingSnake.map[x][y] != 0)
            return true; // true\u4ee3\u8868\u6b64\u5904\u6709\u586b\u5145p
        else
            return false;
    },
    setupSnake: function () {
        for (var i = 1; i <= 5; i++) {
            EatingSnake.snake[i] = {
                x: i + 5,
                y: 7
            };
        }
    },
    drawSnake: function (toggle) {
        for (var i = 1; i < EatingSnake.snake.length; i++) {
            EatingSnake.map[EatingSnake.snake[i].x][EatingSnake.snake[i].y] = toggle;
        }
    },
    newFood: function () {
        do {
            EatingSnake.food.x = Math.floor(Math.random() * (EatingSnake.size - 1) + 1);
            EatingSnake.food.y = Math.floor(Math.random() * (EatingSnake.size - 1) + 1);
        } while (EatingSnake.check(EatingSnake.food.x, EatingSnake.food.y) == true)
        EatingSnake.map[EatingSnake.food.x][EatingSnake.food.y] = 2;
    },
    gameover: function () {
        clearInterval(EatingSnake.interval);

        var requestJSONObject = {
            score: (EatingSnake.snake.length - EatingSnake.baseLen)
        };

        $.ajax({
            url: Label.servePath + "/activity/eating-snake/collect",
            type: "POST",
            cache: false,
            data: JSON.stringify(requestJSONObject),
            beforeSend: function () {
                var $btn = $("button.green");
                $btn.attr("disabled", "disabled").css("opacity", "0.3").text($btn.text() + 'ing');
            },
            success: function (result, textStatus) {
                if (!result.sc) {
                    Util.alert(result.msg);

                    return;
                }

                EatingSnake.snakeCanvas.fillStyle = "black";
                EatingSnake.snakeCanvas.fillRect(150, 100, 300, 200);
                EatingSnake.snakeCanvas.clearRect(155, 105, 290, 190);
                EatingSnake.snakeCanvas.font = '36px serif';
                var textWidth = EatingSnake.snakeCanvas.measureText("Game Over!").width;
                EatingSnake.snakeCanvas.fillText("Game Over!", 155 + (290 - textWidth) / 2, 150);
                EatingSnake.snakeCanvas.font = '24px serif';
                var score = EatingSnake.snake.length - EatingSnake.baseLen;
                textWidth = EatingSnake.snakeCanvas.measureText("Your Score: " + score).width;
                EatingSnake.snakeCanvas.fillText("Your Score: " + score, 155 + (290 - textWidth) / 2, 200);
                EatingSnake.snakeCanvas.fillStyle = "red";
                EatingSnake.snakeCanvas.font = "18px serif";
//                ctx.measureText(txt).width
                var resultText;
                if (score <= 10) {
                    resultText = "\u7ae5\u978b\uff0c\u6362\u952e\u76d8\u5427\uff0c\u8981\u4e0d\u884c\u6362\u624b";
                } else if (score > 10 && score <= 20) {
                    resultText = "\u5982\u6b64\u5e73\u51e1\u7684\u5206\u6570\u6055\u6211\u65e0\u529b\u5410\u69fd";
                } else if (score > 20 && score <= 30) {
                    resultText = "\u54c7\u54e6\uff0c\u597d\u5389\u5bb3\u54e6\uff01";
                } else if (score > 30 && score <= 40) {
                    resultText = "\u54ce\u5440\u6211\u6ef4\u8001\u5929\u7237\u5440";
                } else if (score > 40 && score <= 50) {
                    resultText = "\u8bf7\u6536\u4e0b\u6211\u7684\u819d\u76d6 OTZ";
                } else {
                    resultText = "\u592a\u5047\u4e86\uff01(\u256f\u2035\u25a1\u2032)\u256f\ufe35\u253b\u2501\u253b";
                }
                textWidth = EatingSnake.snakeCanvas.measureText(resultText).width;
                EatingSnake.snakeCanvas.fillText(resultText, 155 + (290 - textWidth) / 2, 250);
            },
            complete: function () {
                var $btn = $("button.green");
                $btn.removeAttr("disabled").css("opacity", "1").text($btn.text().substr(0, $btn.text().length - 3));

            }
        });

    },
    eat: function () {
        EatingSnake.snake[EatingSnake.snake.length] = {
            x: EatingSnake.snake[1].x,
            y: EatingSnake.snake[1].y
        };
        EatingSnake.newFood();
        EatingSnake.snakeColor += 5;
        EatingSnake.appleColor -= 5;
        clearInterval(EatingSnake.interval);
        if (EatingSnake.currTime >= 25) {
            EatingSnake.currTime = EatingSnake.currTime - EatingSnake.stepTime;
        }
        EatingSnake.interval = setInterval(EatingSnake.gameRun, EatingSnake.currTime);
    },
    updateSnake: function () {
        EatingSnake.lastDir.x = EatingSnake.dir.x
        EatingSnake.lastDir.y = EatingSnake.dir.y
        var targetX = EatingSnake.snake[1].x + EatingSnake.dir.x,
                targetY = EatingSnake.snake[1].y + EatingSnake.dir.y;
        if (EatingSnake.check(targetX, targetY)) {
            if (targetX == EatingSnake.food.x && targetY == EatingSnake.food.y) { // eat
                EatingSnake.eat();
            } else { // hit
                EatingSnake.gameover();
                return;
            }
        }
        EatingSnake.drawSnake(0)
        for (var i = EatingSnake.snake.length - 1; i >= 2; i--) {
            EatingSnake.snake[i].x = EatingSnake.snake[i - 1].x
            EatingSnake.snake[i].y = EatingSnake.snake[i - 1].y
        }
        EatingSnake.snake[1].x = targetX
        EatingSnake.snake[1].y = targetY

        EatingSnake.drawSnake(1)
    },
    input: function (keyCode) {
        switch (keyCode) {
            case 65:
            case 37: // \u5de6\u8fb9
                if (EatingSnake.lastDir.x == 0) {
                    EatingSnake.dir.x = -1;
                    EatingSnake.dir.y = 0;
                }
                break;
            case 87:
            case 38: // \u4e0a\u8fb9
                if (EatingSnake.lastDir.y == 0) {
                    EatingSnake.dir.x = 0;
                    EatingSnake.dir.y = -1;
                }
                break;
            case 68:
            case 39: // \u53f3\u8fb9
                if (EatingSnake.lastDir.x == 0) {
                    EatingSnake.dir.x = 1;
                    EatingSnake.dir.y = 0;
                }
                break;
            case 83:
            case 40: // \u4e0b\u8fb9
                if (EatingSnake.lastDir.y == 0) {
                    EatingSnake.dir.x = 0;
                    EatingSnake.dir.y = 1;
                }
                break;
            case 80: // \u5f00\u59cb/\u6682\u505c
                if (EatingSnake.isPause) {
                    EatingSnake.interval = setInterval(gameRun, currTime);
                    EatingSnake.isPause = false;
                } else {
                    clearInterval(interval);
                    EatingSnake.isPause = true;
                }
                break;
        }
    },
    init: function () {
        EatingSnake.dir = {
            x: 0,
            y: 1
        };
        EatingSnake.lastDir = {
            x: 0,
            y: 0
        };
        EatingSnake.map = new Array();
        EatingSnake.food = {
            x: 0,
            y: 0
        };
        EatingSnake.currTime = 200;

        EatingSnake.snake = new Array();
        EatingSnake.setupMap();
        EatingSnake.setupSnake();
        EatingSnake.drawSnake(1);
        EatingSnake.newFood();
        clearInterval(EatingSnake.interval);
    },
    gameRun: function () {
        // countTime += currTime;
        EatingSnake.updateSnake();
        EatingSnake.drawMap();
//        EatingSnake.oMark.innerHtml = EatingSnake.snake.length - EatingSnake.baseLen;
    },
    start: function (csrfToken) {

        window.addEventListener('keydown', function (event) {
            // \u5982\u679c\u6e38\u620f\u7684\u65f6\u5019\u65f6\u4f7f\u7528\u65b9\u5411\u952e
            if (event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 || event.keyCode == 40) {
                // \u963b\u6b62\u65b9\u5411\u952e\u6eda\u5c4f
                event.preventDefault();
                return false;
            }
        });

        $.ajax({
            url: Label.servePath + "/activity/eating-snake/start",
            type: "POST",
            headers: {"csrfToken": csrfToken},
            cache: false,
            success: function (result, textStatus) {
                if (result.sc) {
                    EatingSnake.init();
                    // countTime = 0;
                    EatingSnake.interval = setInterval(EatingSnake.gameRun, EatingSnake.currTime);
                    // startTime = new Date().getTime();

                    return;
                } else {
                    $("#tip").addClass("error").removeClass('succ').html('<ul><li>' + result.msg + '</li></ul>');
                }

                $("#tip").show();

                setTimeout(function () {
                    $("#tip").hide();
                }, 3000);
            }
        });
    }
};
