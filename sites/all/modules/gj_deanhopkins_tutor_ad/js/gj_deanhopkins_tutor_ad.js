document.addEventListener("DOMContentLoaded", function(){
    if (window.location.search.includes("readmore=1")){
        toggleTutorAdFullDescShowMore(jQuery('#tutor-ad-full-desc-show-more-btn')[0]);
    }

    removeStarRatingText();
    hideRemoveButtons();
});

function removeStarRatingText(){
    var container = document.getElementsByClassName("tutor-ad-header")[0];
    if (container){
        var starRatingContainer = container.getElementsByClassName("field-name-field-reference-star-rating")[0];
        var starRatingLabel = starRatingContainer.getElementsByClassName("field-label")[0];
        starRatingLabel.style.display = "none";

        var starRatingAverageContainer = container.getElementsByClassName("fivestar-summary-average-count")[0];
        starRatingAverageContainer.style.display = "none";
    }
}

function tutorAdClickUploadImage(){
    var fileInput = document.getElementById("edit-field-tutor-upload-profile-image-und-0-upload");
    fileInput.click();
}

function hideRemoveButtons(){
    var buts = document.getElementsByClassName("form-submit");
    for (var i=0; i< buts.length; i++){
        var but = buts[i];
        if (but.value == "Remove"){
            but.style.display = "none";
        }
    }
}


//tutor ad references show/hide more
function toggleTutorAdReferencesShowMore(element){
    toggleShowMoreText(element);

    var moreBlock = jQuery('#tutor-ad-references-show-more');
    if (moreBlock.css("display") == "none"){
        moreBlock.css("display", "block")
    } else if (moreBlock.css("display") == "block"){
        moreBlock.css("display", "none")
    }
}

function toggleTutorAdFullDescShowMore(element){
    toggleShowMoreText(element);


    var previewBlock = jQuery('#tutor-ad-full-desc-visible');
    if (previewBlock.css("display") == "none"){
        previewBlock.css("display", "block")
    } else if (previewBlock.css("display") == "block"){
        previewBlock.css("display", "none")
    }

    var moreBlock = jQuery('#tutor-ad-full-desc-show-more');
    if (moreBlock.css("display") == "none"){
        moreBlock.css("display", "block")
    } else if (moreBlock.css("display") == "block"){
        moreBlock.css("display", "none")
    }
}

function toggleTutorAdAboutSessionsShowMore(element){
    toggleShowMoreText(element);


    var previewBlock = jQuery('#tutor-ad-about-sessions-visible');
    if (previewBlock.css("display") == "none"){
        previewBlock.css("display", "block")
    } else if (previewBlock.css("display") == "block"){
        previewBlock.css("display", "none")
    }

    var moreBlock = jQuery('#tutor-ad-about-sessions-show-more');
    if (moreBlock.css("display") == "none"){
        moreBlock.css("display", "block")
    } else if (moreBlock.css("display") == "block"){
        moreBlock.css("display", "none")
    }
}

function toggleShowMoreText(element){
    if (element.innerHTML == "Show more"){
        element.innerHTML = "Show less";
    } else if (element.innerHTML == "Show less"){
        element.innerHTML = "Show more";
    }
}