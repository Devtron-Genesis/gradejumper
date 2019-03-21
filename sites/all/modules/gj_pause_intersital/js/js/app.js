export default class Chat{

  constructor(){
    this.timer = {
      'step1': 4000,
      'step2': 2000,
      'step3': 3000,
      'step4': 18000,
      'step5': 22000,
      'step6': 2000,
      'step7': 45000,
      'step8': 23000,
      'step9': 5000,
    };
    this.chat = document.querySelector('.chat');
    this.message = document.querySelectorAll('.chat__message--hidden');
    this.typing = document.querySelector('.chat__typing');
    this.btn = document.querySelector('.chat__continue');
    this.messageWrap = document.querySelector('.chat__messagesWrap');
    this.connected = document.querySelector('.connected');

    this.connect();
  }

  connect(){

    let connected = this.connected;
    let greeting = document.querySelector('.greeting');
    let header = document.querySelector('.chat__header');
    let manager = document.querySelector('.connected__manager');
    let heading = document.querySelector('.connected__heading');

    setTimeout(()=>{
      manager.classList.remove('connected__manager--hidden');
      manager.classList.add('connected__manager--active');
      heading.innerText = 'Connected with Lisa';

      setTimeout(() => {
        connected.classList.add('connected--hidden');
        greeting.classList.add('greeting--hidden');
        this.chat.classList.add('chat--connect');
        header.classList.remove('chat__header--hidden');
        this.showMessage();

      }, this.timer.step2);

    }, this.timer.step1);

  }

  showMessage(){

    let matchingTutors = ()=> this.matchingTutors();
    let message = document.querySelectorAll('.chat__message--hidden');
    let step5 = this.timer.step5;
    let i = 0;

    setTimeout(() => {

      this.messageWrap.classList.remove('chat__messagesWrap--hidden');

      let interval = setTimeout( function next() {

        if(i === 2){
          return;
        }
        
        message[i].classList.remove('chat__message--hidden');

        setTimeout(() => {
          message[i-1].classList.add('chat__message--active');
        }, 10);
        
        if(i === 1){
          
          matchingTutors();

        }

        i++;

        interval = setTimeout(next, step5);
        
      }, this.timer.step4);
      
    }, this.timer.step3);

  }

  matchingTutors(){

    let typingWrap = document.querySelector('.chat__typingWrap');
    typingWrap.classList.add('chat__typingWrap--hidden');

    setTimeout(() => {
      let heading = document.querySelector('.connected__heading');
      this.connected.classList.remove('connected--hidden');
      this.connected.classList.add('connected--message');
      heading.innerText = 'Finding Matching Tutors...';
      this.messageWrap.appendChild(this.connected);

      setTimeout(() => {
        this.connected.classList.add('connected--hidden');
        typingWrap.classList.remove('chat__typingWrap--hidden');

        setTimeout(() => {
          
          let message = document.querySelector('.chat__message--hidden');
          message.classList.remove('chat__message--hidden');

          setTimeout(() => {
            message.classList.add('chat__message--active');
            this.viewTutors(typingWrap);
          }, 100);

        }, this.timer.step8);

      }, this.timer.step7);

    }, this.timer.step6);

  }

  viewTutors(typing){
    let isLogout = document.querySelector('.chat__isLogout');
    this.btn.classList.remove('chat__continue--hidden');
    typing.classList.add('chat__typingWrap--hidden');
    
    setTimeout(() => {
      isLogout.classList.remove('chat__isLogout--hidden');
    }, this.timer.step9);
    
  }
  
}