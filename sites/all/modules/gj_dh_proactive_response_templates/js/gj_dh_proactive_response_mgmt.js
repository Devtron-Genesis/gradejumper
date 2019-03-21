function gjdhToggleExpanded(element){
    var expanded = element.nextSibling.nextSibling;

    if (expanded.style.display == "none" || expanded.style.display == ""){
        expanded.style.display = "block";
        element.innerHTML = "Hide details"
    } else {
        expanded.style.display = "none";
        element.innerHTML = "Show details"
    }
}