function toggleAppliedVisibility(element){
    var container = findFirstChildByClass(element, "gj-pr-tutor-request-tutor-details-container");
    var downArrow = findFirstChildByClass(element, "gj-pr-tutor-request-tutor-details-hidden");
    var upArrow = findFirstChildByClass(element, "gj-pr-tutor-request-tutor-details-expanded");


    if (container.style.display == "" || container.style.display == "none"){
        container.style.display = "block";
        upArrow.style.display = "block";
        downArrow.style.display = "none";
    } else {
        container.style.display = "none";
        upArrow.style.display = "none";
        downArrow.style.display = "block";
    }

}

function findFirstChildByClass(element, className) {
    var foundElement = null, found;
    function recurse(element, className, found) {
        for (var i = 0; i < element.childNodes.length && !found; i++) {
            var el = element.childNodes[i];
            var classes = el.className != undefined? el.className.split(" ") : [];
            for (var j = 0, jl = classes.length; j < jl; j++) {
                if (classes[j] == className) {
                    found = true;
                    foundElement = element.childNodes[i];
                    break;
                }
            }
            if(found)
                break;
            recurse(element.childNodes[i], className, found);
        }
    }
    recurse(element, className, false);
    return foundElement;
}