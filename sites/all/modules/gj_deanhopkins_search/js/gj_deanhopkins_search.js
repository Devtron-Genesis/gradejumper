function gj_deanhopkins_search_sort(element){
    var sort_by = element.value;

    var paramName = 'sort';
    var newParam = paramName + '=' + sort_by;
    if(window.location.search){
        var regex = new RegExp(paramName + '=[^&$]*', 'i');
        if (regex.test(window.location.search)){
            window.location.search = window.location.search.replace(regex, newParam);
        } else {
            window.location.search += "&" + newParam;
        }
    }else{
        window.location.search = newParam;
    }
}
