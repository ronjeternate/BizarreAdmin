import { useEffect, useState } from "react";
import { db } from "./firebase"; 
import { collection, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Layout from "./Layout";
import AddProduct from "./AddProduct"; 
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "", description: "", gender: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [gender, setGender] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const productList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const confirmDelete = async (id) => {
    setProductToDelete(id); // Fix: Use the passed ID correctly
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
  if (!productToDelete) return;
  try {
    await deleteDoc(doc(db, "products", productToDelete)); // Fix: Remove `.id`
    setProducts((prev) => prev.filter((product) => product.id !== productToDelete));
    toast.success("Product deleted successfully!");
  } catch (error) {
    toast.error("Error deleting product!");
    console.error("Error deleting product:", error);
  } finally {
    setShowDeleteModal(false);
    setProductToDelete(null);
  }
};
  

  const handleEdit = () => {
    if (selectedProduct) {
      setEditMode(true);
      setFormData({
        name: selectedProduct.name || "",
        price: selectedProduct.price || "",
        description: selectedProduct.description || "",
        gender: selectedProduct.gender || "",
        imageUrl: selectedProduct.imageUrl || "",
      });
    }
  };
  

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const imageFormData = new FormData();
    imageFormData.append("file", file);
    imageFormData.append("upload_preset", "bizarre"); 
  
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/dpgkgzhuo/image/upload", {
        method: "POST",
        body: imageFormData,
      });
  
      const data = await res.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.secure_url }));
  
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Error uploading image!");
      console.error("Error uploading image:", error);
    }
  };
  
  
  const handleSave = async () => {
    if (!selectedProduct) return;
  
    setIsSaving(true);
  
    try {
      const productRef = doc(db, "products", selectedProduct.id);
      await updateDoc(productRef, formData);
  
      setSelectedProduct({ ...selectedProduct, ...formData });
      setEditMode(false);
      toast.success("Product updated successfully!");
    } catch (error) {
      toast.error("Error updating product!");
      console.error("Error updating product:", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  
  
  
  

  return (
    <Layout>
      <ToastContainer position="top-right" autoClose={1000} />
      <div className="p-6 min-h-screen">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold">Products</h1>
          <button
            className="text-[15px] mt-4 mb-2 text-blue-600 cursor-pointer"
            onClick={() => setShowModal(true)}
          >
            Add Products
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[80vh]">
            <div className="animate-spin h-16 w-16 border-t-4 border-blue-600 rounded-full"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="border border-white/30 overflow-hidden shadow-lg cursor-pointer"
                onClick={() => {
                  setSelectedProduct(product);
                  setEditMode(false);
                }}
              >
                <img
                  src={product.imageUrl || "No Image"}
                  alt={product.name}
                  className="w-full h-70 object-cover"
                />
                
                <div className="p-4 text-white text-left">
                  <h3 className="font-semibold truncate">{product.name}</h3>
                  <p className="text-[13px] text-white/30">{product.gender}</p>
                  <p className="text-blue-900 text-2xl">₱ {product.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
            <div className="p-6 rounded-lg shadow-lg max-w-md w-full relative">
              <AddProduct onClose={() => setShowModal(false)} />
            </div>
          </div>
        )}

        

        {/* Product Details / Edit Modal */}
        {selectedProduct && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <div
              className="bg-[#1e1f29] border border-blue-950 rounded-2xl shadow-lg p-5 w-full h-150 max-w-6xl flex justify-center  relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-4 text-white hover:text-gray-500 text-3xl cursor-pointer"
                onClick={() => setSelectedProduct(null)}
              >
                &times;
              </button>

              {/* Right Section: Product Details or Edit Form */}
              <div className="w-full p-5 text-left justify-center">
              {editMode ? (
                <>
                  <div className="flex gap-10">
                    <div className="w-1/2">
                      <h2 className="text-white mb-1">Upload New Image:</h2>

                      <div className="relative w-full h-120 border-2 border-dashed border-blue-900 p-3 rounded-lg bg-[#292A36] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-950/10">
                        {formData.imageUrl ? (
                          <>
                            <img
                              src={formData.imageUrl}
                              alt="Preview"
                              className="w-100 h-100 object-cover rounded-lg border border-gray-600"
                            />
                            <button
                              className="mt-3 text-red-400 hover:text-red-500 text-sm cursor-pointer"
                              onClick={() => setFormData({ ...formData, imageUrl: "" })}
                            >
                              Remove Image
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={handleImageUpload}
                            />
                            <div className="flex flex-col items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-900" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M3 3a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H3zm3 3a2 2 0 114 0 2 2 0 01-4 0zm-1 8l3.5-4.5 2.5 3 3.5-4.5L17 14H5z"/>
                              </svg>
                              <p className="text-gray-400 mt-2">Click to upload or drag a new image here</p>
                            </div>
                          </>
                        )}
                      </div>

                
                    </div>

                    <div className="w-1/2">
                      <h2 className="text-white mb-1">Name:</h2>
                      <input
                        type="text"
                        className="w-full p-2 mb-2 text-white rounded border border-white/30"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                      
                      <h2 className="text-white mb-1">Price:</h2>
                      <input
                        type="number"
                        className="w-full p-2 mb-2 text-white rounded border border-white/30"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                      
                      <h2 className="text-white mb-1">Description:</h2>
                      <textarea
                        className="w-full h-30 p-2 mb-2 text-white rounded border border-white/30"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                      
                      <h2 className="text-white mb-1">Gender:</h2>
                      <div className="flex h-10 justify-around text-white mt-0">
                        <label className="flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="Men"
                          className="mr-2"
                          checked={formData.gender === "Men"}
                          onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                        />

                          Men
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="gender"
                            value="Women"
                            className="mr-2"
                            checked={formData.gender === "Women"}
                            onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
                          />

                          Women
                        </label>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          className="flex-1 px-4 py-3 border bg-blue-950/20 text-blue-500 hover:bg-blue-950/30 cursor-pointer rounded-lg"
                          onClick={() => {
                            setEditMode(false);
                            setFormData(selectedProduct); // Reset to original product details
                          }}
                        >
                          Cancel
                        </button>

                        <button
                          className={`flex-1 px-4 py-3 bg-blue-950 hover:bg-blue-950/90 text-white rounded-lg cursor-pointer ${
                            isSaving ? "cursor-not-allowed opacity-50" : ""
                          }`}
                          onClick={handleSave}
                          disabled={isSaving} // Disable button when saving
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </button>


                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-10">
                    <div className="w-1/2 h-full">
                      <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="w-125 h-125 object-cover rounded-lg"
                      />
                    </div>
                      <div className="w-1/2">
                        <h2 className="text-3xl text-white font-semibold pb-5">{selectedProduct.name}</h2>
                        <p className="text-gray-600 pb-5">{selectedProduct.description || "No description available."}</p>
                        <p className="pb-10">
                          <span className="font-semibold text-white">Gender:</span> <span className="text-gray-600">{selectedProduct.gender}</span>
                        </p>
                        <p className="text-blue-500 text-2xl pb-2">₱ {selectedProduct.price}</p>

                        <div className="mt-10 flex space-x-4">
                          <button className="flex-1 px-4 py-3 border bg-blue-950/20 text-blue-500 hover:bg-blue-500/10 cursor-pointer rounded-lg" onClick={handleEdit}>
                            Edit
                          </button>
                          <button
                            className="flex-1 px-4 py-3 bg-blue-950 hover:bg-blue-950/90 text-white flex items-center justify-center cursor-pointer rounded-lg"
                            onClick={() => confirmDelete(selectedProduct.id)}
                          >
                            Delete
                          </button>
                        </div>
                    </div>
                  </div>
                </>
              )}


              {/* Delete Confirmation Modal */}
              {showDeleteModal && (
                <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                    
                    <p className="font-semibold text-center">Are you sure you want to delete this item?</p>
                    <div className="flex justify-end mt-7 space-x-2">
                      <button className="px-4 py-2 flex-1 bg-blue-950/20 text-black rounded" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                      </button>
                      <button className="px-4 py-2 flex-1 bg-blue-950 hover:bg-blue-950/90 text-white rounded" onClick={handleDelete}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductList;
