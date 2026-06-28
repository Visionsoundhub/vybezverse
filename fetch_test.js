fetch('https://blackvybez.gr/beats').then(r => r.text()).then(t => console.log(t.substring(0, 500)));
