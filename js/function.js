(function ($) {
    "use strict";
	
	var $window = $(window); 
	var $body = $('body'); 

	/* Preloader Effect */
	$window.on('load', function(){
		$(".preloader").fadeOut(600);
	});

	if($('.datepicker').length){
		$( ".datepicker" ).datepicker();
	}
	

	/* Hero Slider Layout JS */
	const hero_slider_layout = new Swiper('.hero-slider-layout .swiper', {
		slidesPerView : 1,
		speed: 1000,
		spaceBetween: 0,
		loop: true,
		autoplay: {
			delay: 4000,
		},
		pagination: {
			el: '.hero-pagination',
			clickable: true,
		},
	});

	/* Car Details Slider JS */
	if ($('.car-details-slider').length) {
		const testimonial_slider = new Swiper('.car-details-slider .swiper', {
			slidesPerView : 1,
			speed: 1000,
			spaceBetween: 30,
			loop: true,
			autoplay: {
				delay: 3000,
			},
			navigation: {
				nextEl: '.car-button-next',
				prevEl: '.car-button-prev',
			},
			breakpoints: {
				768:{
				  	slidesPerView: 2,
				},
				991:{
					slidesPerView: 3,
			  	},
				1300:{
				  	slidesPerView: 4,
				},
				1600:{
					slidesPerView: 5,
			  }
			}
		});
	}

	/* client logo slider JS */
	var swiper = new Swiper(".client_logo_slider", {
		slidesPerView: 2,
		spaceBetween: 30,
		loop: true,
		speed: 1500,
		autoplay: {
			delay: 3000,
		},
		breakpoints: {
			768: {
				slidesPerView: 4	
			},
			991: {
				slidesPerView: 6
			}
		}
	});

	/* testimonial Slider JS */
	if ($('.testimonial-slider').length) {
		const testimonial_slider = new Swiper('.testimonial-slider .swiper', {
			slidesPerView : 1,
			speed: 1000,
			spaceBetween: 30,
			loop: true,
			autoplay: {
				delay: 3000,
			},
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
			navigation: {
				nextEl: '.testimonial-button-next',
				prevEl: '.testimonial-button-prev',
			},
			breakpoints: {
				768:{
				  	slidesPerView: 2,
				},
				991:{
				  	slidesPerView: 3,
				}
			}
		});
	}

	/* Fleets Single Image Carousel JS */
	if ($('.fleets-single-slider').length) {
		const property_photos_carousel = new Swiper('.fleets-single-slider .swiper', {
			slidesPerView : 1,
			speed: 1000,
			spaceBetween: 10,
			loop: true,
			centeredSlides: true,
			autoplay: {
				delay: 5000,
			},
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
		});
	}

	/* Team member Testimonial Slider Carousel JS */
	if ($('.team-member-slider').length) {
		const property_photos_carousel = new Swiper('.team-member-slider .swiper', {
			slidesPerView : 1,
			speed: 1000,
			spaceBetween: 30,
			loop: true,
			centeredSlides: true,
			autoplay: {
				delay: 5000,
			},
			pagination: {
				el: '.swiper-pagination',
				clickable: true,
			},
		});
	}

	/* Youtube Background Video JS */
	if ($('#herovideo').length) {
		var myPlayer = $("#herovideo").YTPlayer();
	}

	/* Init Counter */
	if ($('.counter').length) {
		$('.counter').counterUp({ delay: 6, time: 3000 });
	}

	/* Image Reveal Animation */
	if ($('.reveal').length) {
        gsap.registerPlugin(ScrollTrigger);
        let revealContainers = document.querySelectorAll(".reveal");
        revealContainers.forEach((container) => {
            let image = container.querySelector("img");
            let tl = gsap.timeline({
                scrollTrigger: {
                    trigger: container,
                    toggleActions: "play none none none"
                }
            });
            tl.set(container, {
                autoAlpha: 1
            });
            tl.from(container, 1, {
                xPercent: -100,
                ease: Power2.out
            });
            tl.from(image, 1, {
                xPercent: 100,
                scale: 1,
                delay: -1,
                ease: Power2.out
            });
        });
    }

	/* Text Effect Animation */
	if ($('.text-anime-style-1').length) {
		let staggerAmount 	= 0.05,
			translateXValue = 0,
			delayValue 		= 0.5,
		   animatedTextElements = document.querySelectorAll('.text-anime-style-1');
		
		animatedTextElements.forEach((element) => {
			let animationSplitText = new SplitText(element, { type: "chars, words" });
				gsap.from(animationSplitText.words, {
				duration: 1,
				delay: delayValue,
				x: 20,
				autoAlpha: 0,
				stagger: staggerAmount,
				scrollTrigger: { trigger: element, start: "top 85%" },
				});
		});		
	}
	
	if ($('.text-anime-style-2').length) {				
		let	 staggerAmount 		= 0.03,
			 translateXValue	= 20,
			 delayValue 		= 0.1,
			 easeType 			= "power2.out",
			 animatedTextElements = document.querySelectorAll('.text-anime-style-2');
		
		animatedTextElements.forEach((element) => {
			let animationSplitText = new SplitText(element, { type: "chars, words" });
				gsap.from(animationSplitText.chars, {
					duration: 1,
					delay: delayValue,
					x: translateXValue,
					autoAlpha: 0,
					stagger: staggerAmount,
					ease: easeType,
					scrollTrigger: { trigger: element, start: "top 85%"},
				});
		});		
	}
	
	if ($('.text-anime-style-3').length) {		
		let	animatedTextElements = document.querySelectorAll('.text-anime-style-3');
		
		 animatedTextElements.forEach((element) => {
			//Reset if needed
			if (element.animation) {
				element.animation.progress(1).kill();
				element.split.revert();
			}

			element.split = new SplitText(element, {
				type: "lines,words,chars",
				linesClass: "split-line",
			});
			gsap.set(element, { perspective: 400 });

			gsap.set(element.split.chars, {
				opacity: 0,
				x: "50",
			});

			element.animation = gsap.to(element.split.chars, {
				scrollTrigger: { trigger: element,	start: "top 90%" },
				x: "0",
				y: "0",
				rotateX: "0",
				opacity: 1,
				duration: 1,
				ease: Back.easeOut,
				stagger: 0.02,
			});
		});		
	}

	/* Parallaxie js */
	/* var $parallaxie = $('.parallaxie');
	if($parallaxie.length && ($window.width() > 991))
	{
		if ($window.width() > 768) {
			$parallaxie.parallaxie({
				speed: 0.55,
				offset: 0,
			});
		}
	}
	*/

	/* Zoom Gallery screenshot */
	$('.gallery-items').magnificPopup({
		delegate: 'a',
		type: 'image',
		closeOnContentClick: false,
		closeBtnInside: false,
		mainClass: 'mfp-with-zoom',
		image: {
			verticalFit: true,
		},
		gallery: {
			enabled: true
		},
		zoom: {
			enabled: true,
			duration: 300, // don't foget to change the duration also in CSS
			opener: function(element) {
			  return element.find('img');
			}
		}
	});

	/* Book PopUp Form */
	if ($('.popup-with-form').length) {
			$('.popup-with-form').magnificPopup({
			type: 'inline',
			closeOnBgClick: false,
			preloader: false,
			midClick: true
		});
	}

	/* Contact form validation */
	var $contactform = $("#contactForm");
	$contactform.validator({focus: false}).on("submit", function (event) {
		if (!event.isDefaultPrevented()) {
			event.preventDefault();
			submitForm();
		}
	});

	function submitForm(){
		/* Initiate Variables With Form Content*/
		var fname = $("#fname").val();
		var lname = $("#lname").val();
		var email = $("#email").val();
		var phone = $("#phone").val();
		var message = $("#msg").val();

		$.ajax({
			type: "POST",
			url: "form-process.php",
			data: "fname=" + fname + "&lname=" + lname + "&email=" + email + "&phone=" + phone + "&message=" + message,
			success : function(text){
				if (text == "success"){
					formSuccess();
				} else {
					submitMSG(false,text);
				}
			}
		});
	}

	function formSuccess(){
		$contactform[0].reset();
		submitMSG(true, "Message Sent Successfully!")
	}

	function submitMSG(valid, msg){
		if(valid){
			var msgClasses = "h3 text-success";
		} else {
			var msgClasses = "h3 text-danger";
		}
		$("#msgSubmit").removeClass().addClass(msgClasses).text(msg);
	}
	/* Contact form validation end */

	/* Car Booking PopUp form validation */
	var $bookingform = $("#bookingform");
	$bookingform.validator({focus: false}).on("submit", function (event) {
		if (!event.isDefaultPrevented()) {
			event.preventDefault();
			submitbookingform();
		}
	});

	function submitbookingform(){
		/* Initiate Variables With Form Content*/
		var name = $("#name").val();
		var email = $("#email").val();
		var phone = $("#phone").val();
		var phone = $("#cartype").val();
		var phone = $("#pickuplocation").val();
		var date = $("#pickupdate").val();
		var phone = $("#droplocation").val();
		var date = $("#returndate").val();
		var message = $("#msg").val();

		$.ajax({
			type: "POST",
			url: "form-car-booking.php",
			data: "name=" + name + "&email=" + email + "&phone=" + phone + "&cartype=" + cartype + "&pickuplocation=" + pickuplocation + "&pickupdate=" + pickupdate + "&droplocation=" + droplocation + "&returndate=" + returndate + "&message=" + message,
			success : function(text){
				if (text == "success"){
					bookingformSuccess();
				} else {
					appointmentsubmitMSG(false,text);
				}
			}
		});
	}

	function bookingformSuccess(){
		$bookingform[0].reset();
		appointmentsubmitMSG(true, "Message Sent Successfully!")
	}

	function appointmentsubmitMSG(valid, msg){
		if(valid){
			var msgClasses = "h3 text-success";
		} else {
			var msgClasses = "h3 text-danger";
		}
		$("#msgSubmit").removeClass().addClass(msgClasses).text(msg);
	}
	/* Appointment form validation end */

	/* Animated Wow Js */	
	new WOW().init();

	/* Popup Video */
	if ($('.popup-video').length) {
		$('.popup-video').magnificPopup({
			type: 'iframe',
			mainClass: 'mfp-fade',
			removalDelay: 160,
			preloader: false,
			fixedContentPos: true
		});
	}
		
})(jQuery);

// === DeliGo Theme Toggle (single source of truth) ===
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', function () {
    var STORAGE_KEY = 'deligo-theme';
    var html = document.documentElement;
    var btn = document.getElementById('themeToggle');

    // read saved or system
    var saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    var systemDark = false;
    try { systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) {}

    var initial = (saved === 'light' || saved === 'dark') ? saved : (systemDark ? 'dark' : 'light');
    applyTheme(initial);
    updateA11y();

    // watch system only if no manual choice
    try {
      if (!saved && window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
          applyTheme(e.matches ? 'dark' : 'light');
          updateA11y();
        });
      }
    } catch (e) {}

    if (btn) {
      btn.addEventListener('click', function () {
        var isDark = html.getAttribute('data-theme') === 'dark';
        var next = isDark ? 'light' : 'dark';
        applyTheme(next);
        try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
        updateA11y();
      });
    }

    function applyTheme(mode) {
      if (mode === 'dark') {
        html.setAttribute('data-theme', 'dark');   // dark mode
      } else {
        html.removeAttribute('data-theme');        // back to light
      }
      if (!btn) return;
      var icon = btn.querySelector('i');
      if (icon) {
        icon.className = '';
        if (mode === 'dark') icon.classList.add('fa-solid','fa-sun');
        else icon.classList.add('fa-regular','fa-moon');
      }
      var text = btn.querySelector('span');
      if (text) text.textContent = (mode === 'dark') ? 'Light' : 'Dark';
    }

    function updateA11y() {
      if (!btn) return;
      var isDark = html.getAttribute('data-theme') === 'dark';
      btn.setAttribute('aria-pressed', String(isDark));
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  });
})();
// Add class when scrolling
window.addEventListener("scroll", function () {
  if (window.scrollY > 10) {
    document.body.classList.add("scrolled");
  } else {
    document.body.classList.remove("scrolled");
  }
});

// Fixed header helpers: set body offset + add shadow on scroll
document.addEventListener('DOMContentLoaded', function () {
  var sticky = document.querySelector('header.main-header .header-sticky');
  if (!sticky) return;

  function setHeaderOffset() {
    var h = sticky.offsetHeight || 0;
    document.documentElement.style.setProperty('--header-h', h + 'px');
  }
  setHeaderOffset();
  window.addEventListener('resize', setHeaderOffset);

  function onScroll(){
    document.body.classList.toggle('scrolled', window.scrollY > 10);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
});


