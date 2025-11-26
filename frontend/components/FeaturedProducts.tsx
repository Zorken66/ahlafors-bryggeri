import Link from "next/link";

const products = [
  {
    id: 1,
    name: "Pale Ale",
    type: "Öl",
    description: "En klassisk pale ale med perfekt balans mellan humle och malt.",
    style: "Pale Ale",
    alcohol: "5.2%",
    image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?q=80&w=2070"
  },
  {
    id: 2,
    name: "Ahlafors Britt",
    type: "Öl",
    description: "En traditionell svensk bryggd med modern twist.",
    style: "Lager",
    alcohol: "4.8%",
    image: "https://images.unsplash.com/photo-1535958636474-b021ee887b13?q=80&w=2070"
  },
  {
    id: 3,
    name: "Jubileumsipa",
    type: "Öl",
    description: "Vår jubileums-IPA med kraftfull humlekaraktär.",
    style: "IPA",
    alcohol: "6.5%",
    image: "https://images.unsplash.com/photo-1612528443702-f6741f70a049?q=80&w=2070"
  },
  {
    id: 4,
    name: "Ahlafors Märzen",
    type: "Öl",
    description: "Traditionell tysk märzenbier med rik maltkaraktär.",
    style: "Märzen",
    alcohol: "5.5%",
    image: "https://images.unsplash.com/photo-1618183479302-1e0aa382c36b?q=80&w=2070"
  }
];

export default function FeaturedProducts() {
  return (
    <section className="section-padding bg-stone-100">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-lg mb-4">Våra produkter</h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Varje produkt är ett bevis på vårt engagemang för hantverket och kvaliteten
          </p>
          <div className="craft-divider"></div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group bg-white shadow-lg hover:shadow-2xl transition-all duration-300">
              {/* Product Image */}
              <div className="relative h-64 overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url('${product.image}')` }}
                ></div>
                <div className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1 text-sm font-bold">
                  {product.alcohol}
                </div>
              </div>

              {/* Product Info */}
              <div className="p-6">
                <div className="text-xs uppercase tracking-wider text-copper font-semibold mb-2">
                  {product.style}
                </div>
                <h3 className="text-2xl font-serif font-bold mb-3 text-stone-900">
                  {product.name}
                </h3>
                <p className="text-stone-600 mb-4 text-sm leading-relaxed">
                  {product.description}
                </p>
                <Link 
                  href={`/produkter/${product.id}`}
                  className="inline-block text-amber-700 hover:text-amber-900 font-semibold text-sm uppercase tracking-wider transition-colors"
                >
                  Läs mer →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link href="/produkter" className="btn-primary">
            Se alla produkter
          </Link>
        </div>
      </div>
    </section>
  );
}
