"use strict";

(function (window, document) {
	window.App = (function () {

		var app = {}; app.constants = window.CAPSULE || {};

		app.admin_logged = false;

		app.init = function () {

			// GET stamp helper
			app.stamp = function () {
				return Date.now() + '' + new Date().getMilliseconds();
			}

			// lazy binding handler
			app.setup = function () {
				console.log('App finished.');
				$(document).ready(function () {
					cirkus();
					$('a.scrollto')[0].click();
				});
			}

			// Google OAuth2 SignIn endpoint
			app.GoogIn = function (googleUser) {
				var p = googleUser.getBasicProfile();
				var id_token = googleUser.getAuthResponse().id_token;

				$('#goog_login').addClass('hidden');
				$('#goog_logout').removeClass('hidden');
				$('#goog_logout').show();

				App.admin_logged = true;

				var shaObj = new jsSHA('SHA-1', 'TEXT');
				shaObj.update(id_token);
				console.log('SHA1 token: ' + shaObj.getHash('HEX'));
			};

			// Google OAuth2 logout
			app.GoogOut = function (gapi) {
				if (!gapi) return;
				var auth2 = gapi.auth2.getAuthInstance();
				auth2.signOut().then(function () {
					location.href = '/?logout';
				});
			}

		}; return app;
	})(); if (window.addEventListener) window.addEventListener('DOMContentLoaded', window.App.init, false);
})(window, window.document);

// Google Sign In
function GoogleSignIn(googleUser) {
	App.GoogIn(googleUser);
}

// Google Log Out
function GoogleLogOut() {
	App.GoogOut(gapi);
}

// execute function by name in context
function execFn(functionName, context) {
	var args = [].slice.call(arguments).splice(2);
	var namespaces = functionName.split('.');
	var func = namespaces.pop();
	for (var i = 0; i < namespaces.length; i++) {
		context = context[namespaces[i]];
	}
	return context[func].apply(this, args);
}

// trim() prototype
if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

function cirkus() {
	/*============================================
	Page Preloader
	==============================================*/

	$('#page-loader').delay(1000).fadeOut(1000, function () { });

	/*============================================
	Header
	==============================================*/

	$('#home').height($(window).height() + 50);
	$.backstretch('/images/cover_2.jpg.webp');

	$(window).scroll(function () {
		var st = $(this).scrollTop(),
			wh = $(window).height(),
			sf = 1.2 - st / (10 * wh);

		$('.backstretch img').css({
			'transform': 'scale(' + sf + ')',
			'-webkit-transform': 'scale(' + sf + ')'
		});

		$('#home .container').css({ 'opacity': (1.4 - st / 400) });

		if ($(window).scrollTop() > ($(window).height() + 50)) {
			$('.backstretch').hide();
		} else {
			$('.backstretch').show();
		}
	});

	var st = $(this).scrollTop(),
		wh = $(window).height(),
		sf = 1.2 - st / (10 * wh);

	$('.backstretch img').css({
		'transform': 'scale(' + sf + ')',
		'-webkit-transform': 'scale(' + sf + ')'
	});

	$('#home .container').css({ 'opacity': (1.4 - st / 400) });

	/*============================================
	Navigation Functions
	==============================================*/
	if ($(window).scrollTop() < ($(window).height() - 50)) {
		$('#main-nav').removeClass('scrolled');
	} else {
		$('#main-nav').addClass('scrolled');
	}

	$(window).scroll(function () {
		if ($(window).scrollTop() < ($(window).height() - 50)) {
			$('#main-nav').removeClass('scrolled');
		} else {
			$('#main-nav').addClass('scrolled');
		}
	});

	/*============================================
	ScrollTo Links
	==============================================*/
	$('a.scrollto').click(function (e) {
		$('html,body').scrollTo(this.hash, this.hash, {
			gap: {
				y: 0
			}
		}
		);
		e.preventDefault();

		if ($('.navbar-collapse').hasClass('in')) {
			$('.navbar-collapse').removeClass('in').addClass('collapse');
		}
	});

	/*============================================
	Project thumbs - Masonry
	==============================================*/

	$('#projects-container').css({ visibility: 'visible' });

	$('#projects-container').masonry({
		itemSelector: '.project-item:not(.filtered)',
		//columnWidth:370,
		isFitWidth: true,
		isResizable: true,
		isAnimated: !Modernizr.csstransitions,
		gutterWidth: 25
	});

	scrollSpyRefresh();
	waypointsRefresh();

	/*============================================
	Filter Projects
	==============================================*/
	$('#filter-works a').click(function (e) {
		e.preventDefault();

		if ($('#project-preview').hasClass('open')) {
			closeProject();
		}

		$('#filter-works li').removeClass('active');
		$(this).parent('li').addClass('active');

		var category = $(this).attr('data-filter');

		$('.project-item').each(function () {
			if ($(this).is(category)) {
				$(this).removeClass('filtered');
			}
			else {
				$(this).addClass('filtered');
			}

			$('#projects-container').masonry('reload');
		});

		scrollSpyRefresh();
		waypointsRefresh();
	});

	/*============================================
	Project Preview
	==============================================*/
	$('.project-item').click(function (e) {
		e.preventDefault();

		var elem = $(this),
			title = elem.find('.project-title').text(),
			descr = elem.find('.project-description').html(),
			slidesHtml = '<ul class="slides">',
			elemDataCont = elem.find('.project-description'),
			slides = elem.find('.project-description').data('images').split(',');

		for (var i = 0; i < slides.length; ++i) {
			slidesHtml = slidesHtml + '<li><img src="/images/' + slides[i] + '.webp' + '" alt="[image]"></li>';
		}
		slidesHtml = slidesHtml + '</ul>';
		$('#project-title').text(title);
		$('#project-content').html(descr);
		$('#project-slider').html(slidesHtml);
		openProject();
	});

	function openProject() {
		$('#project-preview').addClass('open');
		$('.masonry-wrapper').animate({ 'opacity': 0 }, 300);

		setTimeout(function () {
			$('#project-preview').slideDown();
			$('.masonry-wrapper').slideUp();

			$('html,body').scrollTo(0, '#filter-works',
				{
					gap: { y: -20 },
					animation: {
						duration: 400
					}
				});

			$('#project-slider').flexslider({
				prevText: '<i class="fa fa-angle-left"></i>',
				nextText: '<i class="fa fa-angle-right"></i>',
				animation: 'slide',
				slideshowSpeed: 3000,
				useCSS: true,
				controlNav: true,
				pauseOnAction: false,
				pauseOnHover: true,
				smoothHeight: false,
				start: function () {
					$(window).trigger('resize');
					$('#project-preview').animate({ 'opacity': 1 }, 300);
				}
			});

		}, 300);
	}

	function closeProject() {

		$('#project-preview').removeClass('open');
		$('#project-preview').animate({ 'opacity': 0 }, 300);

		setTimeout(function () {
			$('.masonry-wrapper').slideDown();
			$('#project-preview').slideUp();

			$('#project-slider').flexslider('destroy');
			$('.masonry-wrapper').animate({ 'opacity': 1 }, 300);


		}, 300);

		setTimeout(function () {
			$('#projects-container').masonry('reload');
		}, 500)
	}

	$('.close-preview').click(function () {
		closeProject();
	})

	/*============================================
	Waypoints Animations
	==============================================*/
	$('#skills').waypoint(function () {

		$('.skills-item').each(function () {
			$(this).css({ 'height': $(this).data('height') + '%' });
		})

		$('.skills-bars').css({ 'opacity': 1 });

	}, { offset: '40%' });

	$('.scrollimation').waypoint(function () {
		$(this).addClass('in');
	}, { offset: '90%' });

	/*============================================
	Resize Functions
	==============================================*/
	var thumbSize = $('.project-item').width();

	$(window).resize(function () {
		$('#home').height($(window).height() + 50);

		if ($('.project-item').width() != thumbSize) {

			$('#projects-container').masonry('reload');
			thumbSize = $('.project-item').width();
		}

		scrollSpyRefresh();
		waypointsRefresh();
	});

	/*============================================
	Refresh scrollSpy function
	==============================================*/
	function scrollSpyRefresh() {
		setTimeout(function () {
			$('body').scrollspy('refresh');
		}, 100);
	}

	/*============================================
	Refresh waypoints function
	==============================================*/
	function waypointsRefresh() {
		setTimeout(function () {
			$.waypoints('refresh');
		}, 1000);
	}
}
