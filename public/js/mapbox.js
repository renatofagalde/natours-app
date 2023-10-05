export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoicmVuYXRvZmFnYWxkZSIsImEiOiJja3Jnajg4bWUybDlkMnBuamI4N3VveWxhIn0.g83JP3RDHV8zAOuhYIU0KQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/renatofagalde/ckrgjludo4ied17tqtui7atb6',
    scrollZoom: false,
    zoom: 4,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((location) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
