/*(function ($) {
	if(!getURLParameter('term')){
		var elements = document.getElementsByClassName("product_item");
		for(var i = elements.length - 1; i >= 0; --i)
		{
			elements[i].classList.remove('product-item-active');
			if(elements[i].innerHTML == getURLParameter('term')) {
				load_shop(elements[i]);
			}
		}
		//obj.classList.add('product-item-active');
	}
})(jQuery);*/

(function ($) {

	Drupal.behaviors.nistweaks = {
		attach: function(context, settings) {
			updateWidth();
			window.addEventListener("resize", updateWidth , false);

			if(getURLParameter('term')){
				var elements = document.getElementsByClassName("product_item");
				for(var i = elements.length - 1; i >= 0; --i)
				{
					if(elements[i].className.split(' ')[1] == getURLParameter('term').toLowerCase()) {
						load_shop(elements[i]);
					}
				}
			}

			if (getURLParameter('section')) {
				getSectionObject(getURLParameter('section'));
			}
			else if (document.getElementById('s7_book_wrap')) {

				loadBox(0);
			}
			if(window.location.pathname == "/MyProducts") {
				myproducts_product_selector_arg(getURLParameter('product'));
			}
			var pathArray = window.location.pathname.split( '/' );
			if((pathArray[1] == "users") || (pathArray[1] == "user")) {
				user_pages_fix_active_trail();
			}
			else if(pathArray[1] == "MyAccount") {
				user_pages_fix_active_trail();
			}

			loadBox_and_tick(0);


		}
	};

})(jQuery);

function updateWidth() {

	/*alert(document.documentElement.clientWidth);*/
	var elementsMenu = document.getElementsByClassName("awemenu-megamenu-wrapper");
	for(var i = elementsMenu.length - 1; i >= 0; --i)
	{
		elementsMenu[i].style.width = document.documentElement.clientWidth + 'px';
	}
	/* If we are on the video player pages, then we need to call this to sort the progress indicators out. */
	if (jQuery('#progress-indicator').length > 0) {
		document.getElementById("progress-indicator").style.paddingLeft = progressIndicatorPosition(globalBoxPostn) + "px";
	}
}

function getURLParameter(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null
}

function load_shop(obj) {
	var selectedItem = obj.innerHTML;
	var productSelection = obj.className.split(' ')[1];

	switch (productSelection)
	{
		case 'studynrg':
			jQuery('#layerslider_11').layerSlider(1);
			break;
		case 'studydiet':
			jQuery('#layerslider_11').layerSlider(2);
			break;
		case 'tutorsave':
			jQuery('#layerslider_11').layerSlider(3);
			break;
		case 'gjcoach':
			jQuery('#layerslider_11').layerSlider(4);
			break;
	}
	jQuery('#layerslider_11').layerSlider('stop');

	// Use this to set the background colors
	var elements = document.getElementsByClassName("product_item");
    for(var i = elements.length - 1; i >= 0; --i)
    {
        elements[i].classList.remove('product-item-active');
    }
	obj.classList.add('product-item-active');


	// Hide and display the views
	var elements = document.getElementsByClassName("prices_view_wrap");
    for(var i = elements.length - 1; i >= 0; --i)
    {
        elements[i].style.display = "none";
    }
	document.getElementById('product-type-' + productSelection).style.display = "block";
}

function layerslider_shop_page_init() {
	if(getURLParameter('term')){
		term = getURLParameter('term').toLowerCase();
		switch (term)
		{
			case 'studynrg':
				jQuery('#layerslider_11').layerSlider(1);
				break;
			case 'studydiet':
				jQuery('#layerslider_11').layerSlider(2);
				break;
			case 'tutorsave':
				jQuery('#layerslider_11').layerSlider(3);
				break;
			case 'gjcoach':
				jQuery('#layerslider_11').layerSlider(4);
				break;
		}
		jQuery('#layerslider_11').layerSlider('stop');
	}
}


function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function loadBox(boxnum) {

	var el;
	var prefix = 's7_right_section';
	for(var i = 0; el = document.getElementById(prefix + i); i++) {
		el.style.display = 'none';
	}
	document.getElementById('s7_right_section' + boxnum).style.display = 'block';
	load_left_boxes(boxnum);
}

function load_left_boxes(boxnum) {

	var elements = document.getElementsByClassName("qanda_book_link_div");
	if(elements.length == 0 ){
		var elements = document.getElementsByClassName("qanda_book_link_div_4");
	}
    for(var i = elements.length - 1; i >= 0; --i)
    {
        // PERFORM STUFF ON THE ELEMENT
        elements[i].classList.remove('qanda_book_link_div-active');
    }

	if (document.getElementById('div_qanda_book_link_intro_box')) {
		if(boxnum == 0) {
			document.getElementById("div_qanda_book_link_intro_box").style.fontWeight = "bold";
		}
		else {
			document.getElementById("div_qanda_book_link_intro_box").style.fontWeight = "normal";
			/* Use i-1 as we "box 0" is a different class. */
			elements[boxnum - 1].classList.add('qanda_book_link_div-active');
		}
	}

	var elements = document.getElementsByClassName("nolink");
	/*elements[0].style.fontWeight = "normal";*/
	if(elements.length > 0){
		for(var i = elements.length - 1; i >= 0; --i)
		{
			// PERFORM STUFF ON THE ELEMENT
			elements[i].classList.remove('active_submenu');

			// elements[i] no longer exists past this point, in most browsers
		}
		elements[boxnum].classList.add('active_submenu');
	}
}

function loadBox_and_tick(boxnum) {
	var prefix = 'li_';
	for(var i = 0; el = document.getElementById(prefix + i); i++) {
		el.classList.remove('active_link');
	}

	var el = document.getElementById('li_' + boxnum);
	if(document.getElementById('li_' + boxnum)) {
		el.className += " active_link";
		if(!hasClass(el, 'tick_added')) {
			el.className = el.className + " tick_added";
			el.innerHTML = document.getElementById('li_' + boxnum).innerHTML + '&nbsp;&nbsp;<span style="color: #4BAD31;"><i class="fa fa-check"></i></span>';
		}
	}




		var el;
	var prefix = 's7_right_section';
	for(var i = 0; el = document.getElementById(prefix + i); i++) {
		el.style.display = 'none';
	}
	document.getElementById('s7_right_section' + boxnum).style.display = 'block';
}

function getSectionObject(sectionText) {
	var elements = document.getElementsByClassName("nolink");
    for(var i = elements.length - 1; i >= 0; --i)
    {
        // PERFORM STUFF ON THE ELEMENT
        if(elements[i].innerHTML.toLowerCase() == sectionText.toLowerCase()) {
			loadBox_sub(elements[i]);
		}

        // elements[i] no longer exists past this point, in most browsers
    }
}

function loadBox_sub(obj) {
	switch (obj.innerHTML)
	{
		case 'Formula':
		case 'Intro':
			sectionNumber = 0;
			break;
		case 'Secret 1':
		case 'Benefit 1':
		case 'Expert':
			sectionNumber = 1;
			break;
		case 'Secret 2':
		case 'Benefit 2':
		case 'Science':
			sectionNumber = 2;
			break;
		case 'Secret 3':
		case 'Benefit 3':
		case 'Editor':
			sectionNumber = 3;
			break;
		case 'Secret 4':
		case 'Benefit 4':
		case 'Story':
			sectionNumber = 4;
			break;
		case 'Secret 5':
		case 'Benefit 5':
			sectionNumber = 5;
			break;
		case 'Study Boost':
			sectionNumber = 6;
			break;
	}
	loadBox(sectionNumber);

	var elements = document.getElementsByClassName("nolink");
	elements[0].style.fontWeight = "normal";
    for(var i = elements.length - 1; i >= 0; --i)
    {
        // PERFORM STUFF ON THE ELEMENT
        elements[i].classList.remove('active_submenu');

        // elements[i] no longer exists past this point, in most browsers
    }
	obj.classList.add('active_submenu');
}

function loadAnswer(boxnum) {
	var elements = document.getElementsByClassName("brainboost_question");
    for(var i = elements.length - 1; i >= 0; --i)
    {
        // PERFORM STUFF ON THE ELEMENT
        elements[i].classList.remove('brainboost_question-active');
    }
	elements[boxnum - 1].classList.add('brainboost_question-active');

	var el;
	var prefix = 'brainboost_questions_answer_';
	for(var i = 1; el = document.getElementById(prefix + i); i++) {
		el.style.display = 'none';
	}
	document.getElementById('brainboost_questions_answer_' + boxnum).style.display = 'block';

}


function load_myaccount_studynrg_sections(boxnum) {
	var elements = document.getElementsByClassName("myaccount-studynrg-parts");
    for(var i = elements.length - 1; i >= 0; --i)
    {
        // PERFORM STUFF ON THE ELEMENT
        elements[i].classList.remove('myaccount-studynrg-parts-active');
    }

	var el;
	var prefix = 'myaccount-studynrg-part';
	el = document.getElementById(prefix + boxnum);
	el.classList.add('myaccount-studynrg-parts-active');

	var el;
	var prefix = 'myaccount-content-';
	for(var i = 0; el = document.getElementById(prefix + i); i++) {
		el.style.display = 'none';
	}
	document.getElementById(prefix + boxnum).style.display = 'block';
}

function myproducts_product_selector_arg(product) {
	var el;
	if(product) {

		switch (product)
		{
			case 'studynrg':
				el = document.getElementById('myaccount-id-studynrg');
				break;
			case 'studydiet':
				el = document.getElementById('myaccount-id-studydiet');
				break;
			case 'tutorsave':
				el = document.getElementById('myaccount-id-tutorsave');
				break;
			case 'gjcoach':
				el = document.getElementById('myaccount-id-gjcoach');
				break;
		}

	}
	myproducts_product_selector(el);

}

function myproducts_product_selector(selectedProduct) {
	document.getElementById('myaccount-subpage-StudyNRG').style.display = "none";
	document.getElementById('myaccount-subpage-StudyDiet').style.display = "none";
	document.getElementById('myaccount-subpage-TutorSAVE').style.display = "none";
	document.getElementById('myaccount-subpage-GjSAVE').style.display = "none";

	var elements = document.getElementsByClassName("product_item");
    for(var i = elements.length - 1; i >= 0; --i)
    {
        // PERFORM STUFF ON THE ELEMENT
        elements[i].classList.remove('myaccount-item-active');
    }
	if(selectedProduct) {

		if(selectedProduct.classList.contains('studynrg')) {
			document.getElementById('myaccount-subpage-StudyNRG').style.display = "block";
		}
		if(selectedProduct.classList.contains('studydiet')) {
			document.getElementById('myaccount-subpage-StudyDiet').style.display = "block";
		}
		if(selectedProduct.classList.contains('tutorsave')) {
			document.getElementById('myaccount-subpage-TutorSAVE').style.display = "block";
		}
		if(selectedProduct.classList.contains('gjcoach')) {
			document.getElementById('myaccount-subpage-GjSAVE').style.display = "block";
		}

		selectedProduct.classList.add('myaccount-item-active');
		document.getElementById('myproducts_nonselect_head').style.display = "none";
	}
	else {
		document.getElementById('myproducts_nonselect_head').style.display = "block";

	}

}

function user_pages_fix_active_trail() {
	var elements = document.getElementsByClassName("menu-7360");
    for(var i = elements.length - 1; i >= 0; --i)
    {
        // PERFORM STUFF ON THE ELEMENT
        elements[i].classList.add('active');
    }

	var pathArray = window.location.pathname.split( '/' );

	if((pathArray[1] == "user") && (pathArray[2] === undefined)){
		user_pages_remove_dynatree_active();
	}
	else if((pathArray[1] == "MyAccount") && (pathArray[2] === undefined)){
		user_pages_remove_dynatree_active();
	}
	else if(pathArray[1] == "users"){
		user_pages_remove_dynatree_active();
	}
}

function user_pages_remove_dynatree_active() {
	var elements = document.getElementsByClassName("dynatree-node");

    for(var i = elements.length - 1; i >= 0; --i)
    {
        // PERFORM STUFF ON THE ELEMENT
        elements[i].classList.remove('dynatree-active');
    }
}
