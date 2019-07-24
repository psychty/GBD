// create the ajax request to grab the source JSON data
var request = new XMLHttpRequest();
request.open("GET", "./Deaths_area_x.json", false);
request.send(null);

var json = JSON.parse(request.responseText); // parse the fetched json data into a variable

var data = []; // data is used as the main store of data that you'll later render into D3
var xAxisTitles = []; // used for the x Axis of a chart

var filters = [
    {
        key: 'sex',
        value: 'Male'
    },
    {
        key: 'Parent_cause',
        value: 'All Causes'
    }
]; // if you want to setup any default filter values, do that here. These will immediately filter the data var from above

var filter_button_options = []; // this is used to build up the sidebar

/**
 * This method accepts an array of filters along with the dataset that should be filtered.
 * If you pass three different filter options, the data will be reduced three times and refer
 * to the results of the last filter each time.
 *
 * @param data
 * @param filters
 * @returns {Array}
 */
function filter_data(data, filters) {

    let filtered_data = []; // empty container used to return back the filtered results

    filters.forEach((item) => {
        filtered_data = data.filter((i) => {
            return i[item.key] === item.value;
        })
        data = filtered_data;
    });

    return filtered_data;
}

/**
 * This method allows you to hook up to buttons / interface elements to
 * further filter the dataset using the above filter methods.
 *
 * @param key
 * @param value
 */
function toggleFilter(key, value) {
    filters.forEach((item) => {
        if (item.key === key) {
            item.value = value;
        }
    })
    prepare_data();
}

/**
 * This will prepare the dataset and filter accordingly
 * Called from other methods and on pageload
 */
function prepare_data() {
    data = filter_data(json, filters);
    console.table(data);

    // instantiate D3 at this point, but wrap the setup code in it's own method so you can re-use easily

}

/**
 * This method is used by the sidebar builder function to control what filters are available to the user
 */
function prepare_filter_buttons() {

    let options = [
        {
            name: 'Sex',
            key: 'sex',
            options: [
                'Both', 'Male', 'Female'
            ]
        },
        {
            name: 'Age',
            key: 'age',
            options: [
                'All Ages',
            ]

        },
        {
            name: 'Parent Cause',
            key: 'Parent_cause',
            options: [
                'All Causes', 'Foreign Body'
            ]
        }
    ]

    filter_button_options = options;

}

/**
 * This method is magical 🧙‍♂️
 * It takes the array of optional filters from above and loops through to create
 * dynamically generated select boxes with event listeners attached which then
 * power the filters used on the page
 */
function build_filter_sidebar() {

    filter_button_options.forEach((item) => {
        let div = document.createElement('div');
        let heading = document.createElement('h2');
        let text = document.createTextNode(item.name);
        heading.appendChild(text);

        div.appendChild(heading);

        var select = document.createElement('select');
        select.setAttribute('name', item.key);
        select.classList.add('filter_button');

        item.options.forEach((option) => {
            let opt = document.createElement('option');
            opt.setAttribute('value', option);
            let text = document.createTextNode(option);
            opt.appendChild(text);
            select.appendChild(opt);
        })
        div.appendChild(select);
        document.getElementById('sidebar').appendChild(div);
    })


    // This block below will add a generic input listener to the entire page, because
    // all the select boxes are dynamically created, and browsers are a bit lazy and only
    // take note of the elements on the page when the page is originally loaded. Anything
    // you add after the original pageload needs this sort of lazy event listening to work.

    document.body.addEventListener('input', function (event) {

        // the toggleFilter method is run ONLY if the target item that was changed
        // has the class filter_button.

        if (event.srcElement.className === 'filter_button') {

            toggleFilter(event.srcElement.name, event.target.value);

        }
        ;
    });


}

/**
 * Make an array of the keys of the JSON object to use as xAxis on graphs, for example.
 */
function makeXAxisArray(){
    let arr = json[0];
    xAxisTitles = Object.keys(arr);
    console.log(xAxisTitles);
}

// run all the setup methods to start processing and filtering data on page load

(() => {
    prepare_data();
    prepare_filter_buttons();
    build_filter_sidebar();
    makeXAxisArray();
})();

