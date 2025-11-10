declare module '@mapbox/mapbox-gl-geocoder' {
    import mapboxgl from 'mapbox-gl';

    interface GeocoderOptions {
        accessToken: string;
        mapboxgl?: any; // ← use 'any' here to bypass TS type mismatch
        placeholder?: string;
        marker?: boolean;
        bbox?: [number, number, number, number];
        types?: string;
    }

    class MapboxGeocoder {
        constructor(options: GeocoderOptions);
        onAdd(map: HTMLElement): HTMLElement;
        onRemove(): void;
        on(event: string, callback: (event?: any) => void): void;
    }

    export default MapboxGeocoder;
}
