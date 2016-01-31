/*global $:false */
/*global Jquery, document, localStorage*/
var myQuiz;
myQuiz = {
    i: 0,
    score: 0,
    answers: [],
    correctAnswers: [],
    cookies_set: function (name, value, expires, path, domain, secure) {
        "use strict";
        var cookie_text = encodeURIComponent(name) + "=" +
                          encodeURIComponent(value);
        if (expires instanceof Date) {
            cookie_text += ";expires =" + expires.toGMTString();
        }
        if (path) {
            cookie_text += "; path =" + path;
        }
        if (domain) {
            cookie_text += "; domain =" + domain;
        }
        if (secure) {
            cookie_text += "; secure";
        }
        document.cookie = cookie_text;
    },
    cookies_get : function (name) {
        "use strict";
        var cookieName = encodeURIComponent(name),
            cookieStart = document.cookie.indexOf(cookieName),
            cookieValue = null,
            cookieEnd;
        if (cookieStart > -1) {
            //look for the first semicolon after cookieStart index
            cookieEnd = document.cookie.indexOf(";", cookieStart);
            //if there is no semiColon, then it is the end of the document
            if (cookieEnd ===  -1) {
                cookieEnd = document.cookie.length;
            }
            //get the cookie value
            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.lenght, cookieEnd));
        }
        return cookieValue;
    }
};

//ONLOAD
$(document).ready(function () {
    "use strict";
    //quizTaker constructor
    function Quiztaker(name) {
        this.name = name;
    }
    var beginning = $('#beginning'),
        all = document.cookie,
        allTakers,
        arrayOfCookies = all.split(";"),
        len = arrayOfCookies.length,
        last = len - 1,
        nameOfLastTaker,
        newDiv;
    if (localStorage.hasOwnProperty("users")) {
        allTakers = JSON.parse(localStorage.getItem("users"));
        nameOfLastTaker = decodeURIComponent(arrayOfCookies[last].substring(len === 1 ? 0 : 1, arrayOfCookies[last].indexOf("=")));
        myQuiz.lastTaker = allTakers[nameOfLastTaker];
        if (myQuiz.lastTaker !== undefined) {
            beginning.empty();
            beginning.append("Hi " + myQuiz.lastTaker.name + ", last time you had scored " + myQuiz.lastTaker.score + "!");
            newDiv = document.createElement('div');
            newDiv.id = "newCreated";
            newDiv.innerHTML = "<p class='lead'> Are you a new user? Then please enter your name below to log in:</p>" +
                "<br><input type='text' id='newUser' class='input-large' style='height: 30px'>";
            beginning.append(newDiv);
        }
    }
    //CLICKING THE START BUTTON
    $('#start').on('click', function () {
        var nam = $('#names'),
            ques = $('#questions'),
            firstTime,
            storeStrOne,
            secondTime,
            storeStrTwo,
            cho;
        if (nam.length > 0) {
            myQuiz.takerName = nam.val();
        } else if ($('#newCreated').length > 0) {
            myQuiz.takerName = $('#newUser').val();
        }
        $('#beginning').remove();
        if (!localStorage.hasOwnProperty("users")) {
            firstTime = {};
            firstTime[myQuiz.takerName] = new Quiztaker(myQuiz.takerName !== undefined ? myQuiz.takerName : myQuiz.lastTaker.name);
            storeStrOne = JSON.stringify(firstTime);
            //store our users object
            localStorage.setItem("users", storeStrOne);
            //show a small log in snippet
            $('#nameDisplay').append("Logged in as:<br>" + firstTime[myQuiz.takerName].name);
        } else {
            secondTime = JSON.parse(localStorage.users);
            secondTime[myQuiz.takerName] = new Quiztaker(myQuiz.takerName !== undefined ? myQuiz.takerName : myQuiz.lastTaker.name);
            storeStrTwo = JSON.stringify(secondTime);
            //store our users object
            localStorage.setItem("users", storeStrTwo);
            //show a small log in snippet
            $('#nameDisplay').append("Logged in as:<br>" + secondTime[myQuiz.takerName].name);
        }
        //set display of answers to none, we want to show them with animation
        cho = $('.choices');
        cho.css('display', 'none');
        //parse external json file containing questions and answers to use it
        $.getJSON('quiz.json', function (quiz) {
            //fill in the questions and answers
            ques.text(quiz[myQuiz.i].question);
            $('#zero').text(quiz[myQuiz.i].answers[0]);
            $('#one').text(quiz[myQuiz.i].answers[1]);
            $('#two').text(quiz[myQuiz.i].answers[2]);
            $('#three').text(quiz[myQuiz.i].answers[3]);
        });

        //remove the start button
        $('#start').remove();

        //show the choices class slowly to create an animation effect
        cho.show('slow');

        //show the next button slowly
        $('#next').show('slow');

    });
});


//CLICKING THE NEXT BUTTON
$(document).ready(function () {
    "use strict";
    $(document).on('click', '#next', function () {

        $.getJSON('quiz.json', function (quiz) {
            if (myQuiz.i < quiz.length) {


                // store the answer in an array with its own position, for the first question the position is always 0
                myQuiz.answers[myQuiz.i] = $('input[name="answers"]:checked').val();


                //THE SCORE INCREMENTATION/DECREMENTATION

                //if a question is previously answered false, or not answered, and then answered correct, increment the score
                if ((myQuiz.correctAnswers[myQuiz.i] === false || myQuiz.correctAnswers[myQuiz.i] === undefined) && (myQuiz.answers[myQuiz.i] === quiz[myQuiz.i].correctAnswer)) {
                    myQuiz.score += 1;
                    myQuiz.correctAnswers[myQuiz.i] = true;
                    //if a question is previously answered correct, and again correct do not increment the score
                } else if (myQuiz.correctAnswers[myQuiz.i] === true && (myQuiz.answers[myQuiz.i] === quiz[myQuiz.i].correctAnswer)) {
                    myQuiz.correctAnswers[myQuiz.i] = true;
                    myQuiz.score += 0;
                    //if a question is previously answered correct, and then wrong, decrement the score
                } else if (myQuiz.correctAnswers[myQuiz.i] === true && (myQuiz.answers[myQuiz.i] !== quiz[myQuiz.i].correctAnswer)) {
                    myQuiz.score -= 1;
                    myQuiz.correctAnswers[myQuiz.i] = false;
                    //the more general conditions that should be met: if a question is answered wrong, turn myQuiz.correctAnswers to false
                } else if (myQuiz.answers[myQuiz.i] !== quiz[myQuiz.i].correctAnswer) {
                    myQuiz.correctAnswers[myQuiz.i] = false;
                    //if a it is correct, turn myQuiz.correctAnswers to true
                } else if (myQuiz.answers[myQuiz.i] === quiz[myQuiz.i].correctAnswer) {
                    myQuiz.correctAnswers[myQuiz.i] = true;
                }

                //if the user doesn't make a choice alert him and return undefined
                if (!$('input[name="answers"]').is(':checked')) {
                    alert("please make a choice " + (function () { return myQuiz.takerName !== undefined ? myQuiz.takerName : myQuiz.lastTaker.name; }()));
                    return undefined;
                }


                //PREPARING THE RESULTS TABLE

                //get the user answer string
                var answerString = quiz[myQuiz.i].answers[myQuiz.answers[myQuiz.i]],
                    correctAnswer = quiz[myQuiz.i].correctAnswer;

                //assign the correct answer variable to the correct row of the results table for displaying on the results page.
                $('p[class="correctAnswer"][data-value=' + myQuiz.i + ']').text(quiz[myQuiz.i].answers[correctAnswer]);

                //assign the string of the user answer to the correct row of the results table for displaying on the results page.
                $('p[class="userAnswer"][data-value=' + myQuiz.i + ']').text(answerString);

                //If a question is answered correct, set the background-color of the corresponding row of the results table to transparent.
                if (myQuiz.answers[myQuiz.i] === quiz[myQuiz.i].correctAnswer) {
                    $('tr[class="rowA"][data-name=' + myQuiz.i + ']').css('background', 'transparent');
                    //if not set the background color to red
                } else {
                    $('tr[class="rowA"][data-name=' + myQuiz.i + ']').css('background', '#FE2E64');
                }
            }


            //INCREMENT THE i FOR THE NEXT QUESTION
            myQuiz.i += 1;

            //show the back button
            $('#back').show('slow');

            //SHOWING THE NEXT QUESTION AND NEXT CHOICES
            $.getJSON('quiz.json', function (quiz) {
                var cho = $('.choices'),
                    thirdTime,
                    storeStrThree;
                //only show the questions if there are questions left
                if (myQuiz.i < quiz.length) {
                    //set display of the choices class to none
                    cho.css('display', 'none');
                    //fill in the question div with the new question
                    $('#questions').text(quiz[myQuiz.i].question);
                    //fill in the answers paragraph with the new choices
                    $('#zero').text(quiz[myQuiz.i].answers[0]);
                    $('#one').text(quiz[myQuiz.i].answers[1]);
                    $('#two').text(quiz[myQuiz.i].answers[2]);
                    $('#three').text(quiz[myQuiz.i].answers[3]);
                    //slowly show the choices class for animation effect
                    cho.show('slow');
                }

                //CHECKING AND UNCHECKING RADIO BUTTONS

                //if an answer for the next question is yet to be defined, uncheck the radio buttons
                if (myQuiz.answers[myQuiz.i] === undefined) {
                    $('input[name="answers"]').prop('checked', false);
                }

                //if an answer for the next question is defined, check that answer (the radio button with the correct value)
                if (myQuiz.answers[myQuiz.i] !== undefined) {
                    $('input[name="answers"][value=' + myQuiz.answers[myQuiz.i] + ']').prop('checked', true);
                }
                //if the last question is answered, give a chance to go back and change it
                if (myQuiz.i === quiz.length) {
                    cho.css('display', 'none');
                    $('#questions').text("You have completed the quiz, this is the last chance to change your answers, or you can proceed to your results.");
                }
                //if the user decides to continue we will display the results
                if (myQuiz.i > quiz.length) {
                    $('#quiz').remove();
                    //get back quizTaker object from local storage
                    thirdTime = JSON.parse(localStorage.getItem("users"));
                    //add score property to it
                    thirdTime[myQuiz.takerName].score = myQuiz.score;
                    //stringify it and store it back again with the same name
                    storeStrThree = JSON.stringify(thirdTime);
                    localStorage.setItem("users", storeStrThree);
                    myQuiz.cookies_set(thirdTime[myQuiz.takerName].name, thirdTime[myQuiz.takerName].score, new Date(2014, 8, 25));
                    $('#announcements').text("Hi " + thirdTime[myQuiz.takerName].name + " your score is " + thirdTime[myQuiz.takerName].score + ".");
                    $('#table').fadeIn('fast');
                }
            });
        });
    });
});

//CLICKING THE BACK BUTTON
$(document).on('click', '#back', function () {
    "use strict";

    //stores the answer the user gave, if he clicks the back button, important to store it without decrementing the i
    myQuiz.answers[myQuiz.i] = $('input[name="answers"]:checked').val();

    //if i is bigger than or equal to 0 decrement the i
    if (myQuiz.i > 0) {
        myQuiz.i -= 1;
    }

    $.getJSON('quiz.json', function (quiz) {

        //set display of the choices class to none
        var cho = $('.choices');
        cho.css('display', 'none');
        //fill the questions div with the decrement i question
        $('#questions').text(quiz[myQuiz.i].question);
        //fill in the choices with the decremented i
        $('#zero').text(quiz[myQuiz.i].answers[0]);
        $('#one').text(quiz[myQuiz.i].answers[1]);
        $('#two').text(quiz[myQuiz.i].answers[2]);
        $('#three').text(quiz[myQuiz.i].answers[3]);
        cho.show('slow');
        //select the button again which the user had selected
        $('input[name="answers"][value=' + myQuiz.answers[myQuiz.i] + ']').prop('checked', true);
    });
});



