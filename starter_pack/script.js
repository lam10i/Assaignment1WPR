/* get element*/
const url='http://localhost:3000/attempts';
const intro=document.querySelector('#introduction');
const attemptQuiz=document.querySelector('#attempt-quiz');
const reviewQuiz=document.querySelector('#review-quiz');
const startButton=document.querySelector('#start-btn');
const submitButton=document.querySelector('#submit-btn');
const tryButton=document.querySelector('#try-btn');
const submitBox=document.querySelector('#submit-quiz');
const resultBox=document.querySelector('#result-box');

/* global varaibles*/
let attemptId='';
const answers={};

/* handle api*/
const fetchApi=async() =>{
    const result= await fetch(url,{method:'POST'
});
    return result.json();
}
const submitQuiz=async () =>{
    const result=await fetch(`${url}/${attemptId}/submit`,{
        method:'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({answers})
    })
    return result.json();
}
/* when user click
   set class for input
*/
const selectAnswer=(event) =>{
    const input=event.currentTarget;
    const parent=input.parentElement;
    const anscestor=parent.parentElement;
    const selectedInput=anscestor.querySelector('.selected-answer');
    if(selectedInput){
        selectedInput.classList.remove('selected-answer');
    }
    input.classList.add('selected-answer');
    
};
/* update answers object*/
const getUserAnswers=() =>{
    const inputs=document.querySelectorAll('.selected-answer');
   inputs.forEach((input) => {
        const id=input.getAttribute('questionId');
        answers[id]= parseInt(input.getAttribute('value')) ;
   })
}
/*create attemptQuiz and reviewQuiz */
const buildAttemptQuiz=async () =>{
    const res=await fetchApi();
    attemptId=res._id;
    res.questions.forEach((question,index) =>{
        const questionContainer=document.createElement('div');
        questionContainer.classList.add('question');
        const questionNum=document.createElement('div');
        questionNum.classList.add('question-heading');
        questionNum.textContent=`Question ${index+1} of 10`;
        const questionText=document.createElement('div');
        questionText.classList.add('questionText');
        questionText.textContent=question.text;
        questionContainer.appendChild(questionNum);
        questionContainer.appendChild(questionText);
        question.answers.forEach((answer,index) => {
            const questionItem=document.createElement('div');
            questionItem.classList.add('question-item');
           const input= document.createElement('input');
           input.setAttribute('id',`${index}${question._id}`);
           input.setAttribute('type','radio');
           input.setAttribute('name',question._id);
           input.setAttribute('value',index);
           input.setAttribute('questionId',question._id);
           input.addEventListener('click',selectAnswer);
           const label=document.createElement('label');
           label.classList.add('answerText');
           label.setAttribute('for',`${index}${question._id}`);
           label.textContent=answer;
           questionItem.appendChild(input);
           questionItem.appendChild(label);
           questionContainer.appendChild(questionItem);
        });
        attemptQuiz.appendChild(questionContainer);
    })
}

const buildReviewQuiz=async() =>{
    const res=await submitQuiz();
    const correctAnswers=res.correctAnswers;
    res.questions.forEach((question,index) =>{
        const questionContainer=document.createElement('div');
        questionContainer.classList.add('question');

        const questionNum=document.createElement('div');
        questionNum.classList.add('question-heading');
        questionNum.textContent=`Question ${index+1} of 10`;

        const questionText=document.createElement('div');
        questionText.classList.add('questionText');
        questionText.textContent=question.text;

        questionContainer.appendChild(questionNum);
        questionContainer.appendChild(questionText);

        question.answers.forEach((answer,index) => {
            const questionItem=document.createElement('div');
            questionItem.classList.add('question-item');

           const input= document.createElement('input')
           input.setAttribute('type','radio');
            input.disabled=true;
           const label=document.createElement('label');
           label.textContent=answer;
           label.classList.add('answerText');

           const userChoice=document.createElement('span');
           userChoice.classList.add('check-answer-span');
           userChoice.textContent='Your answer';

           const correctChoice=document.createElement('span');
           correctChoice.classList.add('check-answer-span');
           correctChoice.textContent='Correct answer';

            if(answers[question._id] === correctAnswers[question._id] && answers[question._id]=== index){
                label.appendChild(correctChoice);
                label.classList.add('right');
                input.checked=true;
            }
            if(answers[question._id] != correctAnswers[question._id]  && answers[question._id]==index){
                label.appendChild(userChoice);
                label.classList.add('wrong');
                input.checked=true;
            }
            if(answers[question._id] != correctAnswers[question._id]  && correctAnswers[question._id]==index){
                label.appendChild(correctChoice);
                label.classList.add('no-choose');
            }

           questionItem.appendChild(input);
           questionItem.appendChild(label);
           questionContainer.appendChild(questionItem);
        });
       reviewQuiz.appendChild(questionContainer);
    })
    displayResult(res.score,res.scoreText);
};

/* delete old quiz*/
function refreshQuestion(){
    const questions=document.querySelectorAll('.question');
    for(const question of questions){
        question.remove();
    }
}
/* update result */
function displayResult(score,scoreText){
    const scoreDisplay=document.querySelector('#score');
    const scorePercentDisplay=document.querySelector('#score-percent');
    const scoreTextDisplay=document.querySelector('#score-text');
    scoreDisplay.innerText=`${score}/10`;
    scorePercentDisplay.innerText=`${score*10}%`;
    scoreTextDisplay.innerText=scoreText
}
/* confirm submit or not*/
function confirmSubmit(){
    return confirm(" Do you want to submit the quiz?");
}
/* handle button when click*/
startButton.addEventListener('click',async function (){
    intro.classList.add('hidden');
    await buildAttemptQuiz();
    document.body.scrollIntoView();
    attemptQuiz.classList.remove('hidden');
   submitBox.classList.remove('hidden');
});
submitButton.addEventListener('click', async function(){
    const submitChoice= confirmSubmit();
    if(submitChoice){
        submitBox.classList.add('hidden');
        attemptQuiz.classList.add('hidden');
        getUserAnswers();
        await buildReviewQuiz();
        document.body.scrollIntoView();
        reviewQuiz.classList.remove('hidden');
        resultBox.classList.remove('hidden');
    }
})
tryButton.addEventListener('click', function (){
    document.body.scrollIntoView();
    refreshQuestion();
    reviewQuiz.classList.add('hidden');
    resultBox.classList.add('hidden');
    intro.classList.remove('hidden');
})


