$(function() {
	// PNG Fallback for SVG
	if(!Modernizr.svg) {
    	$('img[src*="svg"]').attr('src', function() {
        	return $(this).attr('src').replace('.svg', '.png');
    	});
	}
});

//open navigation on small devices
$(function() {
	$(".navigation_toggle").click(function() {
		$(".navigation ul").slideToggle();
		return false;
	});
});

//close navi on link click for mobile devices
$(function() {
	if ($(".navigation_toggle").is(":visible")) {
		$('.navigation ul a').click(function(){
			$(".navigation ul").slideToggle();
		});
	}
});

//animated scrolling on anchor link click
function scrollTo(hash){
	//position of anchor target
	var targetOffset = $(hash).offset().top;

	//nav correction
	targetOffset -= $(".navigation-wrap").height();

	$("html,body").animate({
		scrollTop: targetOffset
	}, 1000, 'easeInOutQuart');
}

//animated scrolling and legal notice expand
$(function() {
	$('a[href^="#"]').not(".link_legal-notice").not('[data-toggle*="tab"]').click(function(){
		$active = $(this);
		var hash = $active.attr("href");
		scrollTo(hash);
		return false;
	});
	$(".link_legal-notice").click(function() {
		if ($("#legal-notice-wrapper").is(":visible")) {
			$("#legal-notice-wrapper").slideUp(600, 'easeOutQuad');
		} else {
			$("#legal-notice-wrapper").show();
			scrollTo("#legal-notice-wrapper");
		}
		return false;
	});
});

//select navigation item on reaching section
function selectNavigationLink(id) {
	$(".navigation ul a").removeClass("active");
	$('.navigation ul a[href^="#' + id + '"]').addClass("active");
}

$(function() {
	selectNavigationLink('home');
	$("section").not("#legal-notice-wrapper").waypoint(function(direction) {
		var $this = $(this);
		if (direction === "up") {
			$active = $this.prev();
		} else {
			$active = $this;
		}
		var activeId = $active.attr('id');

		//activate section links or the link for the home header
		if (activeId){
			selectNavigationLink(activeId);
		} else {
			selectNavigationLink("home");
		}
	}, {
		offset: "50%"
	});
	$(".navigation_brand").waypoint(function() {
		selectNavigationLink("home");
	});
});

//sticky nav
$(function() {
	$('.navigation-wrap').waypoint('sticky');
});