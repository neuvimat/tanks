const Cfg = require('./Config.js');

// This module renders the interactive fields that allow changing the game configuration on the fly
// The only way to reset it is either manually or by reloading the page

function makeInput(attr) {
    let input = document.createElement('input');
    input.type = 'number';
    input.value = Cfg[attr];
    // Fix step
    if (input.value - Math.floor(input.value) !== 0) input.step = 0.1;
    // Add event to input
    input.addEventListener('input', (e) => {
        Cfg[attr] = Number.parseFloat(e.target.value);
    });
    // Wrap result in td
    let tdInput = document.createElement('td');
    tdInput.appendChild(input);

    return tdInput;
}

module.exports = {
    /**
     * Creates the HTML for the the debug widget
     * @returns {HTMLDivElement}
     */
    getDebugNode: function () {
        let table = document.createElement('table');
        table.innerHTML = "<tr><th>Property</th><th>Value</th></tr>";

        let tbody = table.querySelector('tbody');

        for (let attr in Cfg) {
            let row = document.createElement('tr');

            // Text
            let text = document.createElement('td');
            text.innerText = attr;

            // Input
            let tdInput = makeInput(attr);
            // Append input
            row.appendChild(text);
            row.appendChild(tdInput);
            tbody.appendChild(row);
        }
        let wrapper = document.createElement('div');
        wrapper.className = 'properties';
        wrapper.appendChild(table);
        return wrapper;
    }
};