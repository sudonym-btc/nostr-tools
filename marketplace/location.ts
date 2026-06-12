import {
  gTags,
  type MarketplaceLocationGTag,
  type MarketplaceLocationProvider,
} from '@sudonym-btc/marketplace-location-interface'

export type {
  AddressToCoordinates,
  AreaToPolygon,
  GeoJSON,
  MarketplaceCoordinates,
  MarketplaceLocationGTag,
  MarketplaceLocationProvider,
} from '@sudonym-btc/marketplace-location-interface'

export interface MarketplaceLocationsApi extends MarketplaceLocationProvider {
  gTags(cells: Iterable<string>): MarketplaceLocationGTag[]
}

function requireLocationProvider(provider: MarketplaceLocationProvider | undefined): MarketplaceLocationProvider {
  if (!provider) throw new Error('Marketplace location provider is not configured')
  return provider
}

export function createMarketplaceLocationsApi(provider?: MarketplaceLocationProvider): MarketplaceLocationsApi {
  return {
    gTags,
    async hierarchyForAddress(address: string): Promise<MarketplaceLocationGTag[]> {
      return requireLocationProvider(provider).hierarchyForAddress(address)
    },
    async coverArea(area: string): Promise<MarketplaceLocationGTag[]> {
      return requireLocationProvider(provider).coverArea(area)
    },
  }
}

export const locations = {
  gTags,
  create: createMarketplaceLocationsApi,
}
