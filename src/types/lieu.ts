export interface Lieu {
  nom_usuel: string
  adresse: string
  coordonnees_geo: {
    lat: number
    lon: number
  }
}