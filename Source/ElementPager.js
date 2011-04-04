/**
 * Class ElementPager
 * 
 * This class will create a toolbar, containing links to show/hide elements on the page
 * 
 * @usage
 * var defaultPager = new ElementPager($$('elementsToPaginate')); 
 * var customPager  = new ElementPager(
 * 		$$('elementsToPaginate'), 						// Elements to paginate
 * 		{
 * 			itemsPerPage: 6,							// Number of displayed elements par page
 * 			hideClass: 'customHideClass',				// A CSS class that hides the elements (display:none;)
 * 			toolbar: {
 * 				'location': $('toolbarReciever'),		// Toolbar location: 'before' (before first element), 'after' (after the last element) or can be an element on the page
 * 				'class': 'customToolbarClass',			// CSS class to add the toolbar div
 *				'linkContainerClass': 'customClass'		// CSS class to add the links container (useful for centering the links)
 * 			},
 *			links: {
 *				currentClass: 'customCurrentClass',		// CSS class to add the current page link
 *				disabledClass: 'customDisabledClass'	// CSS class to add the disabled links
 *			}
 * 		}
 * );
 * @author Pierre Aboucaya (Asper)
 * @license MIT License (http://www.opensource.org/licenses/mit-license.php)
 */
var ElementPager = new Class({
	Implements: [Options, Events],
	
	/**
	 * Elements to be paginated
	 */
	elements: [],
	
	/**
	 * Links to change the pages
	 */
	links: [],
	
	/**
	 * Total number of pages
	 */
	pageCount: 0,
	
	/**
	 * Current page number
	 */
	currentPage: 0,
	
	/**
	 * Links to go to the first/last/previous/next page
	 */
	metalinks: $H(),
	
	options: {
		itemsPerPage: 1,
		hideClass: 'elementPagerHide',
		toolbar: {
			location: 'after',
			cssClass: 'elementPagerToolbar',
			linkContainerClass: 'pages',
			showNextPrevious: true,
			showFirstLast: true
		},
		links: {
			currentClass: 'current',
			disabledClass: 'disabled'
		},
		events: {
			init: $empty,
			beforeChange: $empty,
			afterChange: $empty
		}
	},
	
	/**
	 * Creates the toolbar and shows page 1
	 */
	initialize: function(elements, options){
		this.elements = $$(elements);
		this.setOptions(options);
		if( !this.elements.length || this.elements.length <= this.options.itemsPerPage ) return;
		this.toolbar();
		this.fireEvent('init', this);
		this.showPage(0);
	},
	
	/**
	 * Creates the toolbar, the links and injects it in the page
	 */
	toolbar: function(){
		// Create the toolbar and the link container div
		var toolbar = new Element('div', {'class': this.options.toolbar.cssClass});
		var linkCtnr = new Element('div', {'class': this.options.toolbar.linkContainerClass});
		
		// A link that will be cloned
		var defaultLink = new Element('a', { 'href': '#' });
		
		// Save page count
		var linkCount = Math.ceil( this.elements.length / this.options.itemsPerPage );
		this.pageCount = linkCount;

		// Create the first/last links
		if(this.options.toolbar.showFirstLast){
			var first = defaultLink.clone().addClass('first').set('text', '<<').addEvent('click', function(e){
				e.preventDefault();
				this.showPage( 0 );
			}.bind(this)).inject( toolbar );
			this.metalinks.set('first', first);
			var last = defaultLink.clone().addClass('last').set('text', '>>').addEvent('click', function(e){
				e.preventDefault();
				this.showPage( this.pageCount-1 );
			}.bind(this)).inject( toolbar );
			this.metalinks.set('last', last);
		}
		
		// Create the next/previous links
		if(this.options.toolbar.showNextPrevious){
			var prev = defaultLink.clone().addClass('prev').set('text', '<').addEvent('click', function(e){
				e.preventDefault();
				this.showPage( this.currentPage-1 );
			}.bind(this)).inject( toolbar );
			this.metalinks.set('prev', prev);
			var next = defaultLink.clone().addClass('next').set('text', '>').addEvent('click', function(e){
				e.preventDefault();
				this.showPage( this.currentPage+1 );
			}.bind(this)).inject( toolbar );
			this.metalinks.set('next', next);
		}
		
		// Create the links
		linkCount.times(function( index ){
			var currentLink = defaultLink.clone().set('text', index+1).addEvent('click', function(e){
				e.preventDefault();
				this.showPage( index );
			}.bind(this)).inject( linkCtnr );
			this.links.push( currentLink );
		}.bind(this));
		linkCtnr.inject(toolbar);
		
		// Add events
		this.addEvent('init', this.options.events.init);
		this.addEvent('beforeChange', this.options.events.beforeChange);
		this.addEvent('afterChange', this.options.events.afterChange);
		
		// Inject the toolbar at the right place
		var toolBarLocationType = $type(this.options.toolbar.location).toLowerCase();
		switch( toolBarLocationType ){
			case 'string':
				if( toolBarLocationType == 'before' ){
					toolbar.inject( this.elements[0], 'before' );
				}
				else{
					toolbar.inject( this.elements[this.elements.length-1], 'after' );
				}
				break;
			case 'element':
				toolbar.inject( this.options.toolbar.location );
				break;
			default:
				toolbar.inject( this.elements[this.elements.length-1], 'after' );
				break;
		}
	},
	
	/**
	 * Get a set of elements that are attached to a specific page number
	 * @param int pageNumber The number of the page. Defaults to 0
	 */
	getPageElements: function( pageNumber ){
		var pageNumber = this.limitPageNumber( pageNumber );
		
		// Compute first and last elements to show
		var firstElementIndex = pageNumber * this.options.itemsPerPage;
		var lastElementIndex = firstElementIndex + this.options.itemsPerPage-1;
		
		// Filter elements to show
		var elementsToReturn = this.elements.filter(function(element, index){
			return index >= firstElementIndex && index <= lastElementIndex;
		});	
		
		return elementsToReturn;
	},
	
	/**
	 * Shows a page
	 * @param int number The number of the page. Defaults to 0
	 */
	showPage: function( pageNumber ){
		var pageNumber = this.limitPageNumber( pageNumber );
		
		// beforeChange Event
		this.fireEvent('beforeChange', [this, pageNumber]);
		
		// Get elements to be displayed
		var elementsToShow = this.getPageElements( pageNumber );
		
		// Show page
		this.elements.addClass(this.options.hideClass);
		elementsToShow.removeClass(this.options.hideClass);
		
		// Activate link
		var currentClass = this.options.links.currentClass;
		this.links.each(function(link){
			link.removeClass(currentClass);
		});
		this.links[pageNumber].addClass(currentClass);
		
		// If page is first or last disable links
		this.metalinks.each(function(value, key){
			this.metalinks.get(key).removeClass( this.options.links.disabledClass );
		}.bind(this));
		if(pageNumber === 0){
			if( this.metalinks.has('first') ) this.metalinks.get('first').addClass( this.options.links.disabledClass );
			if( this.metalinks.has('prev') ) this.metalinks.get('prev').addClass( this.options.links.disabledClass );
		}
		if(pageNumber == this.pageCount-1){
			if( this.metalinks.has('last') ) this.metalinks.get('last').addClass( this.options.links.disabledClass );
			if( this.metalinks.has('next') ) this.metalinks.get('next').addClass( this.options.links.disabledClass );
		}
		
		// Save the current page
		this.currentPage = pageNumber;
		
		// afterChange Event
		this.fireEvent('afterChange', [this, pageNumber]);
	},
	
	limitPageNumber: function( pageNumber ){
		return $type(pageNumber) == 'number'  ? pageNumber.limit( 0, this.pageCount-1 ) : 0;
	}
});