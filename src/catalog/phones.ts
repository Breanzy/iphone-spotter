import type { Finish, Phone } from './types'

// The Catalog: every Phone, whether or not it has an Asset yet.
//
// Dimensions, Finishes and Tells were written from memory and have NOT been
// checked against Apple's spec pages (support.apple.com/specs). Finish hex
// values are eyeballed approximations. Verify before relying on either.

const f = (name: string, hex: string): Finish => ({ name, hex })

const BLACK = f('Black', '#1f2020')
const WHITE = f('White', '#f2f1ec')
const SPACE_GRAY = f('Space Gray', '#4a4a4c')
const SILVER = f('Silver', '#e3e4e5')
const GOLD = f('Gold', '#e7d3b5')
const ROSE_GOLD = f('Rose Gold', '#e6c3bb')
const RED = f('(PRODUCT)RED', '#b4141e')
const MIDNIGHT = f('Midnight', '#232a31')
const STARLIGHT = f('Starlight', '#f0e9df')
const GRAPHITE = f('Graphite', '#54524f')

function phone(
  id: string,
  name: string,
  year: number,
  [heightMm, widthMm, depthMm]: [number, number, number],
  finishes: Finish[],
  tells: string[],
): Phone {
  return { id, name, year, dimensions: { heightMm, widthMm, depthMm }, finishes, tells }
}

export const PHONES: Phone[] = [
  phone('iphone', 'iPhone', 2007, [115, 61, 11.6], [f('Aluminum', '#b9bcbf')], [
    'Brushed aluminum back with a black plastic strip along the bottom',
  ]),
  phone('iphone-3g', 'iPhone 3G', 2008, [115.5, 62.1, 12.3], [BLACK, WHITE], [
    'Glossy curved plastic back',
    'Chrome rim around the front',
  ]),
  phone('iphone-3gs', 'iPhone 3GS', 2009, [115.5, 62.1, 12.3], [BLACK, WHITE], [
    'Same curved plastic back as the 3G; the back text is in shiny silver lettering',
  ]),
  phone('iphone-4', 'iPhone 4', 2010, [115.2, 58.6, 9.3], [BLACK, WHITE], [
    'Flat glass front and back with a steel band around the sides',
    'Separate round volume buttons',
  ]),
  phone('iphone-4s', 'iPhone 4S', 2011, [115.2, 58.6, 9.3], [BLACK, WHITE], [
    'Glass sandwich like the 4, but with extra breaks in the steel band at the top',
  ]),
  phone('iphone-5', 'iPhone 5', 2012, [123.8, 58.6, 7.6], [
    f('Black & Slate', '#2b2b2d'),
    f('White & Silver', '#e8e8e6'),
  ], ['Taller, thin aluminum body with glass strips at the top and bottom of the back']),
  phone('iphone-5c', 'iPhone 5c', 2013, [124.4, 59.2, 8.97], [
    WHITE,
    f('Pink', '#f4a3ae'),
    f('Yellow', '#f7e88a'),
    f('Blue', '#5fb5e5'),
    f('Green', '#a8d58a'),
  ], ['Glossy one-piece colored plastic shell']),
  phone('iphone-5s', 'iPhone 5s', 2013, [123.8, 58.6, 7.6], [SPACE_GRAY, SILVER, GOLD], [
    'Home button with a steel ring and no square icon',
    'Pill-shaped dual-tone flash on the back',
  ]),
  phone('iphone-6', 'iPhone 6', 2014, [138.1, 67, 6.9], [SPACE_GRAY, SILVER, GOLD], [
    'Rounded aluminum body with plastic antenna lines across the back',
    'Camera lens sticks out slightly',
  ]),
  phone('iphone-6-plus', 'iPhone 6 Plus', 2014, [158.1, 77.8, 7.1], [SPACE_GRAY, SILVER, GOLD], [
    'Large rounded body with antenna lines across the back',
  ]),
  phone('iphone-6s', 'iPhone 6s', 2015, [138.3, 67.1, 7.1], [SPACE_GRAY, SILVER, GOLD, ROSE_GOLD], [
    'Looks like the 6, but adds Rose Gold and an "S" mark on the back',
  ]),
  phone('iphone-6s-plus', 'iPhone 6s Plus', 2015, [158.2, 77.9, 7.3], [SPACE_GRAY, SILVER, GOLD, ROSE_GOLD], [
    'Looks like the 6 Plus, but adds Rose Gold and an "S" mark on the back',
  ]),
  phone('iphone-se-1', 'iPhone SE (1st generation)', 2016, [123.8, 58.6, 7.6], [SPACE_GRAY, SILVER, GOLD, ROSE_GOLD], [
    'The 5s body with matte-finished chamfered edges',
  ]),
  phone('iphone-7', 'iPhone 7', 2016, [138.3, 67.1, 7.1], [
    f('Jet Black', '#0e0e0f'), BLACK, SILVER, GOLD, ROSE_GOLD, RED,
  ], [
    'Antenna lines move to curve along the top and bottom edges of the back',
    'No headphone jack',
  ]),
  phone('iphone-7-plus', 'iPhone 7 Plus', 2016, [158.2, 77.9, 7.3], [
    f('Jet Black', '#0e0e0f'), BLACK, SILVER, GOLD, ROSE_GOLD, RED,
  ], ['Two cameras side by side in a horizontal pill']),
  phone('iphone-8', 'iPhone 8', 2017, [138.4, 67.3, 7.3], [SPACE_GRAY, SILVER, GOLD, RED], [
    'Glass back with no antenna lines, single camera',
  ]),
  phone('iphone-8-plus', 'iPhone 8 Plus', 2017, [158.4, 78.1, 7.5], [SPACE_GRAY, SILVER, GOLD, RED], [
    'Glass back with two cameras in a horizontal pill',
  ]),
  phone('iphone-x', 'iPhone X', 2017, [143.6, 70.9, 7.7], [SPACE_GRAY, SILVER], [
    'Edge-to-edge screen with a notch and no home button',
    'Two cameras stacked vertically in a pill',
  ]),
  phone('iphone-xr', 'iPhone XR', 2018, [150.9, 75.7, 8.3], [
    BLACK, WHITE, f('Blue', '#4fa3d9'), f('Yellow', '#f9d045'), f('Coral', '#f56b58'), RED,
  ], ['Notched screen with thicker bezels and a single camera on an aluminum frame']),
  phone('iphone-xs', 'iPhone XS', 2018, [143.6, 70.9, 7.7], [SPACE_GRAY, SILVER, GOLD], [
    'Looks like the X, but comes in Gold and has an extra antenna break at the bottom',
  ]),
  phone('iphone-xs-max', 'iPhone XS Max', 2018, [157.5, 77.4, 7.7], [SPACE_GRAY, SILVER, GOLD], [
    'Large notched phone with two vertically stacked cameras',
  ]),
  phone('iphone-11', 'iPhone 11', 2019, [150.9, 75.7, 8.3], [
    BLACK, WHITE, f('Green', '#b9e0c8'), f('Yellow', '#fbe58c'), f('Purple', '#c9bde3'), RED,
  ], ['Square camera bump with two lenses, glossy back, matte bump']),
  phone('iphone-11-pro', 'iPhone 11 Pro', 2019, [144, 71.4, 8.1], [
    SPACE_GRAY, SILVER, GOLD, f('Midnight Green', '#4e5851'),
  ], ['Three lenses in a triangle inside a square bump, matte back']),
  phone('iphone-11-pro-max', 'iPhone 11 Pro Max', 2019, [158, 77.8, 8.1], [
    SPACE_GRAY, SILVER, GOLD, f('Midnight Green', '#4e5851'),
  ], ['Large phone with a triangle of three lenses and a matte back']),
  phone('iphone-se-2', 'iPhone SE (2nd generation)', 2020, [138.4, 67.3, 7.3], [BLACK, WHITE, RED], [
    'The iPhone 8 body, with the Apple logo centered on the back',
  ]),
  phone('iphone-12-mini', 'iPhone 12 mini', 2020, [131.5, 64.2, 7.4], [
    BLACK, WHITE, f('Blue', '#2b4e74'), f('Green', '#cde6d0'), RED, f('Purple', '#c7bfdd'),
  ], ['Very small flat-edged phone with a notch and diagonal dual cameras']),
  phone('iphone-12', 'iPhone 12', 2020, [146.7, 71.5, 7.4], [
    BLACK, WHITE, f('Blue', '#2b4e74'), f('Green', '#cde6d0'), RED, f('Purple', '#c7bfdd'),
  ], ['Flat edges are back; two lenses stacked vertically in a square bump']),
  phone('iphone-12-pro', 'iPhone 12 Pro', 2020, [146.7, 71.5, 7.4], [
    GRAPHITE, SILVER, GOLD, f('Pacific Blue', '#2f4452'),
  ], ['Shiny steel flat edges with three lenses and a LiDAR dot']),
  phone('iphone-12-pro-max', 'iPhone 12 Pro Max', 2020, [160.8, 78.1, 7.4], [
    GRAPHITE, SILVER, GOLD, f('Pacific Blue', '#2f4452'),
  ], ['Large steel-edged phone with three lenses and LiDAR']),
  phone('iphone-13-mini', 'iPhone 13 mini', 2021, [131.5, 64.2, 7.65], [
    MIDNIGHT, STARLIGHT, f('Blue', '#2c5a7a'), f('Pink', '#f6dfd9'), RED, f('Green', '#384b3f'),
  ], ['Small phone with two lenses placed diagonally']),
  phone('iphone-13', 'iPhone 13', 2021, [146.7, 71.5, 7.65], [
    MIDNIGHT, STARLIGHT, f('Blue', '#2c5a7a'), f('Pink', '#f6dfd9'), RED, f('Green', '#384b3f'),
  ], ['Two lenses placed diagonally in a square bump, smaller notch']),
  phone('iphone-13-pro', 'iPhone 13 Pro', 2021, [146.7, 71.5, 7.65], [
    GRAPHITE, SILVER, GOLD, f('Sierra Blue', '#9bb5ce'), f('Alpine Green', '#576856'),
  ], ['Much larger three-lens bump than the 12 Pro, smaller notch']),
  phone('iphone-13-pro-max', 'iPhone 13 Pro Max', 2021, [160.8, 78.1, 7.65], [
    GRAPHITE, SILVER, GOLD, f('Sierra Blue', '#9bb5ce'), f('Alpine Green', '#576856'),
  ], ['Large phone with a big three-lens bump and smaller notch']),
  phone('iphone-se-3', 'iPhone SE (3rd generation)', 2022, [138.4, 67.3, 7.3], [MIDNIGHT, STARLIGHT, RED], [
    'The iPhone 8 body in Midnight or Starlight',
  ]),
  phone('iphone-14', 'iPhone 14', 2022, [146.7, 71.5, 7.8], [
    MIDNIGHT, STARLIGHT, f('Blue', '#a0b4c7'), f('Purple', '#e5ddea'), RED, f('Yellow', '#f9e479'),
  ], ['Notch and diagonal dual cameras, like the 13']),
  phone('iphone-14-plus', 'iPhone 14 Plus', 2022, [160.8, 78.1, 7.8], [
    MIDNIGHT, STARLIGHT, f('Blue', '#a0b4c7'), f('Purple', '#e5ddea'), RED, f('Yellow', '#f9e479'),
  ], ['Large non-Pro phone with a notch and two lenses']),
  phone('iphone-14-pro', 'iPhone 14 Pro', 2022, [147.5, 71.5, 7.85], [
    f('Space Black', '#403e3d'), SILVER, GOLD, f('Deep Purple', '#594f63'),
  ], ['Dynamic Island pill instead of a notch, steel frame']),
  phone('iphone-14-pro-max', 'iPhone 14 Pro Max', 2022, [160.7, 77.6, 7.85], [
    f('Space Black', '#403e3d'), SILVER, GOLD, f('Deep Purple', '#594f63'),
  ], ['Large phone with Dynamic Island and a steel frame']),
  phone('iphone-15', 'iPhone 15', 2023, [147.6, 71.6, 7.8], [
    BLACK, f('Blue', '#d4e4ef'), f('Green', '#dfe9d8'), f('Yellow', '#f7ecc4'), f('Pink', '#f2dde0'),
  ], ['Dynamic Island on a non-Pro phone, frosted color-infused glass back', 'USB-C port']),
  phone('iphone-15-plus', 'iPhone 15 Plus', 2023, [160.9, 77.8, 7.8], [
    BLACK, f('Blue', '#d4e4ef'), f('Green', '#dfe9d8'), f('Yellow', '#f7ecc4'), f('Pink', '#f2dde0'),
  ], ['Large frosted-glass phone with Dynamic Island and two lenses']),
  phone('iphone-15-pro', 'iPhone 15 Pro', 2023, [146.6, 70.6, 8.25], [
    f('Black Titanium', '#3b3b3d'), f('White Titanium', '#e8e6e1'),
    f('Blue Titanium', '#3e4656'), f('Natural Titanium', '#bab4a9'),
  ], ['Brushed titanium frame with softer rounded edges', 'Action button replaces the mute switch']),
  phone('iphone-15-pro-max', 'iPhone 15 Pro Max', 2023, [159.9, 76.7, 8.25], [
    f('Black Titanium', '#3b3b3d'), f('White Titanium', '#e8e6e1'),
    f('Blue Titanium', '#3e4656'), f('Natural Titanium', '#bab4a9'),
  ], ['Large titanium phone with an Action button']),
  phone('iphone-16', 'iPhone 16', 2024, [147.6, 71.6, 7.8], [
    BLACK, WHITE, f('Pink', '#f5b5d3'), f('Teal', '#a9d6cf'), f('Ultramarine', '#7c88e6'),
  ], ['Two lenses stacked vertically in a pill-shaped bump', 'Camera Control button on the right side']),
  phone('iphone-16-plus', 'iPhone 16 Plus', 2024, [160.9, 77.8, 7.8], [
    BLACK, WHITE, f('Pink', '#f5b5d3'), f('Teal', '#a9d6cf'), f('Ultramarine', '#7c88e6'),
  ], ['Large phone with a vertical pill camera and Camera Control']),
  phone('iphone-16-pro', 'iPhone 16 Pro', 2024, [149.6, 71.5, 8.25], [
    f('Black Titanium', '#3c3c3d'), f('White Titanium', '#f2f1ed'),
    f('Natural Titanium', '#c2bcb2'), f('Desert Titanium', '#bfa48f'),
  ], ['Titanium frame with Camera Control and thinner bezels than the 15 Pro']),
  phone('iphone-16-pro-max', 'iPhone 16 Pro Max', 2024, [163, 77.6, 8.25], [
    f('Black Titanium', '#3c3c3d'), f('White Titanium', '#f2f1ed'),
    f('Natural Titanium', '#c2bcb2'), f('Desert Titanium', '#bfa48f'),
  ], ['The tallest titanium phone, with Camera Control']),
  phone('iphone-16e', 'iPhone 16e', 2025, [146.7, 71.5, 7.8], [BLACK, WHITE], [
    'Notched screen with a single camera on a modern flat-edged body',
  ]),
  phone('iphone-17', 'iPhone 17', 2025, [149.6, 71.5, 7.95], [
    BLACK, WHITE, f('Mist Blue', '#a8bccf'), f('Sage', '#b8c2a6'), f('Lavender', '#d8c8e6'),
  ], ['Vertical pill camera on a larger screen with thinner bezels than the 16']),
  phone('iphone-air', 'iPhone Air', 2025, [156.2, 74.7, 5.64], [
    f('Space Black', '#2a2a2c'), f('Cloud White', '#f3f2ee'),
    f('Light Gold', '#ecdcc0'), f('Sky Blue', '#cfe2f0'),
  ], ['Extremely thin body with a full-width camera bar holding a single lens']),
  phone('iphone-17-pro', 'iPhone 17 Pro', 2025, [150, 71.9, 8.75], [
    SILVER, f('Cosmic Orange', '#e8743b'), f('Deep Blue', '#2e3a55'),
  ], ['Aluminum body with a full-width camera plateau across the top of the back']),
  phone('iphone-17-pro-max', 'iPhone 17 Pro Max', 2025, [163.4, 78, 8.75], [
    SILVER, f('Cosmic Orange', '#e8743b'), f('Deep Blue', '#2e3a55'),
  ], ['Large phone with a full-width camera plateau']),
]

export const PHONES_BY_ID: ReadonlyMap<string, Phone> = new Map(PHONES.map((p) => [p.id, p]))
