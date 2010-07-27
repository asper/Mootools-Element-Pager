Class ElementPager
==================

This class will create a toolbar, containing links to show/hide elements on the page

Usage
-----

    var defaultPager = new ElementPager($$('elementsToPaginate')); 
    var customPager  = new ElementPager(
    		$$('elementsToPaginate'), 						// Elements to paginate
    		{
    			itemsPerPage: 6,							// Number of displayed elements par page
    			hideClass: 'customHideClass',				// A CSS class that hides the elements (display:none;)
    			toolbar: {
    				'location': $('toolbarReciever'),		// Toolbar location: 'before' (before first element), 'after' (after the last element) or can be an element on the page
    				'class': 'customToolbarClass',			// CSS class to add the toolbar div
    				'linkContainerClass': 'customClass'		// CSS class to add the links container (useful for centering the links)
    			},
    			links: {
    				currentClass: 'customCurrentClass',		// CSS class to add the current page link
    				disabledClass: 'customDisabledClass'	// CSS class to add the disabled links
    			}
    		}
    );