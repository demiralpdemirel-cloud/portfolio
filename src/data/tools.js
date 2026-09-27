export const tools = [
  { name: 'Blender', category: '3D', tags: ['3D', 'CGI', 'Modeling', 'Rendering'], priority: 'primary' },
  { name: 'OctaneRender', category: '3D', tags: ['Rendering', 'Look development'] },
  { name: 'Cinema 4D', category: '3D', tags: ['3D', 'Motion', 'Modeling'] },
  { name: 'Corona Renderer', category: '3D', tags: ['Rendering', 'Archviz'] },
  { name: 'Adobe After Effects', category: 'VFX', tags: ['VFX', 'Compositing', 'Motion'], priority: 'primary' },
  { name: 'Boris FX Mocha Pro', category: 'VFX', tags: ['Tracking', 'Rotoscoping', 'Compositing'], priority: 'primary' },
  { name: 'Boris FX Silhouette', category: 'VFX', tags: ['Rotoscoping', 'Paint', 'Compositing'], priority: 'primary' },
  { name: 'Keying Suite', category: 'VFX', tags: ['Keying', 'Compositing'] },
  { name: 'Topaz Video AI', category: 'AI', tags: ['Restoration', 'Upscaling'], priority: 'primary' },
  { name: 'Upscayl', category: 'AI', tags: ['Image', 'Upscaling'] },
  { name: 'Adobe Photoshop', category: 'PHOTOGRAPHY / IMAGE', tags: ['Image', 'Retouching', 'Design'], priority: 'primary' },
  { name: 'Adobe Illustrator', category: 'PHOTOGRAPHY / IMAGE', tags: ['Vector', 'Design'] },
  { name: 'Adobe Premiere Pro', category: 'EDITING', tags: ['Editing', 'Post-production'], priority: 'primary' },
  { name: 'Adobe Media Encoder', category: 'EDITING', tags: ['Encoding', 'Delivery'] },
  { name: 'HandBrake', category: 'EDITING', tags: ['Encoding', 'Delivery'] },
]

const categoryOrder = ['3D', 'VFX', 'AI', 'PHOTOGRAPHY / IMAGE', 'EDITING']

export const toolCategories = categoryOrder.map((name, index) => ({
  id: String(index + 1).padStart(2, '0'),
  name,
  tools: tools.filter(tool => tool.category === name),
}))

export const toolVisualStages = [
  { type: 'image', label: '3D / ATMOSPHERE', media: 'media/tools/3d-background.webp', alt: 'Abstract polygonal 3D geometry background' },
  { type: 'image', label: 'VFX / ATMOSPHERE', media: 'media/tools/vfx-background.webp', alt: 'Green screen production background' },
  { type: 'image', label: 'AI / ATMOSPHERE', media: 'media/tools/ai-background.webp', alt: 'Abstract computational data visualization background' },
  { type: 'image', label: 'IMAGE / ATMOSPHERE', media: 'media/tools/photography-background.webp', alt: 'Camera lens on a dark background' },
  { type: 'image', label: 'EDITING / ATMOSPHERE', media: 'media/tools/editing-background.webp', alt: 'Analog film strips background' },
]

export const toolAssetCredits = [
  { media: 'media/tools/3d-background.webp', source: 'Unsplash', author: 'Logan Voss', sourceUrl: 'https://unsplash.com/photos/abstract-3d-rendering-of-a-glowing-pink-and-gray-form--HXVDuyYbFw', license: 'Unsplash License' },
  { media: 'media/tools/vfx-background.webp', source: 'Unsplash', author: 'Benjamin Lehman', sourceUrl: 'https://unsplash.com/photos/camera-monitor-displaying-green-screen-backdrop-ZK6pSQ-yYJ4', license: 'Unsplash License' },
  { media: 'media/tools/ai-background.webp', source: 'Unsplash', author: 'Logan Voss', sourceUrl: 'https://unsplash.com/photos/abstract-glowing-lines-forming-a-complex-data-visualization-20BjhzK9Nxs', license: 'Unsplash License' },
  { media: 'media/tools/photography-background.webp', source: 'Unsplash', author: 'Thomas Murphy', sourceUrl: 'https://unsplash.com/photos/a-camera-lens-on-a-black-background-YFGguxtAvWA', license: 'Unsplash License' },
  { media: 'media/tools/editing-background.webp', source: 'Unsplash', author: 'Etienne Girardet', sourceUrl: 'https://unsplash.com/photos/a-pile-of-film-strips-with-pictures-on-them-QyFDgLRjaiU', license: 'Unsplash License' },
]
