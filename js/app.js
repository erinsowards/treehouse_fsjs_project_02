/* jshint node: true */
"use strict";

var totalItemsNL = document.getElementsByClassName('student-item');
var itemsPerPage = 10;

var paginationDiv;
var paginationAnchors;

var searchButton;
var searchString = "";

var messageP;

/*
	Pagination
*/
function calculateNumberOfPages(array) {
	// Check if the array exists, or has no items
	if (!array || array.length === 0) {
		return 1;	
	}
	// Math.ceil rounds the total pages up
	return Math.ceil(array.length / itemsPerPage);
}

function buildPaginationMenuHTML(array) {    
	var numberOfPages = calculateNumberOfPages(array);
	
	if (numberOfPages > 1) {
		var paginationHTML = '<div class="pagination">';
		paginationHTML += '<ul>';
		
		for (var i = 1; i <= numberOfPages; i++) {
			paginationHTML += '<li><a href="#">' + i + '</a></li>'; 
		}
	
		paginationHTML += '</ul>';
		paginationHTML += '</div>';
		
		// Add it to the end of the page
		var pageDiv = document.getElementsByClassName('page');
		pageDiv[0].innerHTML += paginationHTML;
		
		// Set up pagination anchors
		paginationDiv = document.getElementsByClassName('pagination');
		paginationAnchors = paginationDiv[0].getElementsByTagName('a');
		
		// Add listeners
		for (var j = 0; j < paginationAnchors.length; j++) {
			var paginationAnchor = paginationAnchors[j];
			paginationAnchor.addEventListener('click', paginationMenuEventHandler, false);
		}

		// Set first anchor class to active by default
		paginationAnchors[0].className = 'active';
	}
}

function removeActiveClassNames() {	
	var currentAnchors = document.getElementsByClassName('active');
	
	for (var i = 0; i < currentAnchors.length; i++) {
		var thisAnchor = currentAnchors[i];
		thisAnchor.className = '';
	}
}

function paginationMenuEventHandler(event) {
	// Stop the anchor from going to #
	event.preventDefault();
	
	// Remove the current active classes
	removeActiveClassNames();
	
	// Set the anchor's class that is clicked to active
	event.target.className = 'active';
	
	// Create a variable for the page number and convert to a number
	var currentPageNumber = parseInt(event.target.text);
	
	// Get the search results that will create the pagination menu
	var searchResultsArray = searchNamesAndEmail(searchString);
	
	// Call the function that determines what to show in each page set
	displayPage(searchResultsArray, currentPageNumber);
}

function displayPage(searchResultsArray, currentPageNumber) {   	
	// Calculate the starting and stopping index to show
	getStartIndex(currentPageNumber);
	getStopIndex(currentPageNumber);
	
	// Create a copy of the searchResultsArray to hold the page set to show 
	var pageSetToShowArray = whichItemsToShow(searchResultsArray, currentPageNumber);
	
	// Update the page x out of y text
	pageXOutOfYHTML(searchResultsArray, currentPageNumber);
	
	// totalItemsNL is a nodelist of all the li's with .student-item
	setItemsToHide(totalItemsNL);
	setItemsToShow(pageSetToShowArray);
}

function getStartIndex(currentPageNumber) {
	// For example: (1 x 10) - 10 = 0
	return (currentPageNumber * itemsPerPage) - itemsPerPage; 
}

function getStopIndex(currentPageNumber) {
	// For example: (1 x 10) = 10
	return (currentPageNumber * itemsPerPage);
}

function whichItemsToShow(array, currentPageNumber) {
	// Creates a copy of an array with the set of items to show
	return array.slice(getStartIndex(currentPageNumber), getStopIndex(currentPageNumber));
}

function setItemsToHide(array) {
	for (var i = 0; i < array.length; i++) {
		array[i].className = 'student-item cf hide';
	}
}

function setItemsToShow(array) {
	for (var i = 0; i < array.length; i++) {
		array[i].className = 'student-item cf show';
	}
}


/*
	Search
*/
function buildSearchFormHTML() {
	var searchHTML = '<div class="student-search">';
	searchHTML += '<input type="text" id="searchInput" placeholder="Search for students...">';
	searchHTML += '<button>Search</button>';
	searchHTML += '</div>';
	
	// Add it to the end of the page header div
	var pageHeaderDiv = document.getElementsByClassName('page-header');
	pageHeaderDiv[0].innerHTML += searchHTML;
}

function searchHandler() {
	// Get the input string to run the search
	searchString = getInputString();
	
	// searchNamesAndEmail returns an array of found items
	// If searchString is empty, all items are returned
	var searchResultsArray = searchNamesAndEmail(searchString);
	
	// Display the page, always starting at the first page
	displayPage(searchResultsArray, 1);
	
	// Remove the pagination div, if it exists, and rebuild it with each search
	if (paginationDiv) {
        removeElement(paginationDiv, paginationDiv[0]);
    }
	buildPaginationMenuHTML(searchResultsArray);
	
	// Prints out a message if no results found
	ifNoResultsFoundHTML(searchResultsArray);	
	
	// Add listeners to the searchButton each time a search is done
	searchButton = document.getElementsByTagName('button');
	searchButton[0].addEventListener('click', searchHandler, false);
}

function getInputString() {
	var searchInput = document.getElementById('searchInput');
	var inputString = searchInput.value;
	// Return the string in all lowercase for case insensitivity
	// Remove any spaces on either side of the string
	return inputString.trim().toLowerCase(); 
}

function searchNamesAndEmail(inputString) {
	var itemsFoundArray = [];
	
	// RegEx matches name.lastname@email.com
	var re = new RegExp("(\\w+)\\.(\\w+)@(\\w+)\\.(\\w+)");
	
	// Returns true if the inputString is a match
	var isEmail = re.test(inputString);
	
	if (inputString === '') {
		itemsFoundArray = searchInputIsEmpty();
	} else if (isEmail) {
		itemsFoundArray = searchInputIsEmailAddress(inputString);
	} else {
		itemsFoundArray = searchInputIsName(inputString);
	}
	return itemsFoundArray;
}

function searchInputIsEmpty() {
	// Returns all the li's with .student-item class
	// The page initially runs with all the items returned
	var itemsFoundArray = [];
	for (var i = 0; i < totalItemsNL.length; i++) {
		var listItem = totalItemsNL[i];
		itemsFoundArray.push(listItem);
	}
	return itemsFoundArray;
}

function searchInputIsEmailAddress(inputString) {
	var itemsFoundArray = [];
	// Email addresses to search through are in spans with the class .email
	var emailsToSearch = document.getElementsByClassName('email');
	
	for (var i = 0; i < emailsToSearch.length; i++) {
		// Get the span element
		var itemSpan = emailsToSearch[i];
		// Get the span element's text, which is the email address to search against
		var itemEmail = itemSpan.textContent;
		
		// If the user input matches any of the email addresses
		if (itemEmail.indexOf(inputString) !== -1) {
			// Get the list item containing the found email address
			var foundEmailMatch = itemSpan.parentNode.parentNode;
			// Push the list item into the itemsFoundArray, only one email will be a match
			itemsFoundArray.push(foundEmailMatch);
		}
	}
	return itemsFoundArray;	
}

function searchInputIsName(inputString) {
	var itemsFoundArray = [];
	// Names are in h3 elements
	var namesToSearch = document.getElementsByTagName('h3');
	
	for (var i = 0; i < namesToSearch.length; i++) {
		// Get the h3 heading element
		var itemHeading = namesToSearch[i];
		// Get the h3's text, which is the name
		var itemName = itemHeading.textContent;
		
		if (itemName.indexOf(inputString) !== -1) {
			// Get the list item containing the found name fragment
			var foundItem = itemHeading.parentNode.parentNode;
			// Push the list item into the itemsFoundArray
			itemsFoundArray.push(foundItem);
		}
	}
	return itemsFoundArray;
}

function pageXOutOfYHTML(searchResultsArray, currentPageNumber) {
	// Main heading on the page is an h2
	var pageHeaderH2 = document.getElementsByTagName('h2');
	
	var fromNumber = getStartIndex(currentPageNumber) + 1;
	var toNumber = getStopIndex(currentPageNumber);
	
	var pageXOutOfYString = 'Students <span>Students ';	
		
	if (searchResultsArray.length === 0) {
		pageXOutOfYString += '0-0 out of 0';
	} else if (toNumber > searchResultsArray.length) {
		// When you get to the last anchor of the pagination menu
		// the toNumber needs to show the total results, not the toNumber
		pageXOutOfYString += fromNumber + '-' + searchResultsArray.length + ' out of ' + searchResultsArray.length;
	}  else {
		pageXOutOfYString += fromNumber + '-' + toNumber + ' out of ' + searchResultsArray.length;
	}
		
	pageXOutOfYString += '</span>';	
	
	// Writes over the current text of the h2
	pageHeaderH2[0].innerHTML = pageXOutOfYString;
}

function ifNoResultsFoundHTML(searchResultsArray) {
	// If the search results are empty
	if (searchResultsArray.length === 0) {
		var pageDiv = document.getElementsByClassName('page');
		var noResultsFoundHTML = '<p class="message">Sorry, no students matched your search.</p>';
		// Add the message to the end of the page
		pageDiv[0].innerHTML += noResultsFoundHTML;
		
		// Now get the p elements with the message class
		messageP = document.getElementsByClassName('message');
		
		// Each empty search writes another p tag
		// Remove the second p tag each time
		if (messageP.length > 1) {
			removeElement(messageP, messageP[1]);
		}
	} 
	else if (searchResultsArray.length > 0) {
		// If the search yields results
		// And if the message exists, remove it
		if (messageP) {
			removeElement(messageP, messageP[0]);
		}
	} 
}

function removeElement(nodelist, elementToRemove) {	
	if (elementToRemove) {
        elementToRemove.parentNode.removeChild(elementToRemove);
    }
}

buildSearchFormHTML();
searchHandler();