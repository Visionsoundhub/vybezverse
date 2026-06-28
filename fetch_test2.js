fetch('https://blackvybez.gr/').then(r => r.text()).then(t => {
  const match = t.match(/<link rel="stylesheet".*?>/g);
  console.log('CSS Links found:', match);
});
