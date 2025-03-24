import { useState } from "react";
import axios from "axios";
import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TextField, Box } from "@mui/material";

const AddProduct = ({ onClose }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const uploadImageAndSaveProduct = async () => {
    if (!image || !name || !price || !description || !gender) {
      toast.error("Please fill in all fields and select an image." , {autoClose:1000});
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", image);
    formData.append("upload_preset", "bizarre");
    formData.append("cloud_name", "dpgkgzhuo");
    formData.append("folder", "product-images");

    try {
      const uploadRes = await axios.post(
        `https://api.cloudinary.com/v1_1/dpgkgzhuo/image/upload`,
        formData
      );

      const imageUrl = uploadRes.data.secure_url;

      await addDoc(collection(db, "products"), {
        name,
        price: parseFloat(price),
        description,
        gender,
        imageUrl,
      });

      toast.success("Product added successfully!", {autoClose:1000});
      onClose();
    } catch (error) {
      console.error("Error uploading image or saving product:", error);
      toast.error("Failed to add product. Please try again." , {autoClose:1000});
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex justify-center items-center backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-[#1e1f29] p-6 rounded-2xl shadow-xl w-[1100px] border border-blue-950 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {/* Close Button */}
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-white cursor-pointer"
            onClick={onClose}
          >
            <X size={22} />
          </button>

          <div className="flex gap-10">
            <div className="w-1/2 relative border-2 border-dashed border-blue-900 p-5 rounded-lg bg-[#292A36] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-950/10">
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-100 h-100 object-cover rounded-lg border border-gray-600"
                  />
                  <button
                    className="mt-3 text-red-400 hover:text-red-500 text-sm cursor-pointer"
                    onClick={() => {
                      setPreview("");
                      setImage(null);
                    }}
                  >
                    Remove Image
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-blue-900"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M3 3a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2H3zm3 3a2 2 0 114 0 2 2 0 01-4 0zm-1 8l3.5-4.5 2.5 3 3.5-4.5L17 14H5z" />
                    </svg>
                    <p className="text-gray-400 mt-2">
                      Click to upload or drag an image here
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="w-1/2">
              <h2 className="text-xl font-semibold text-white text-center mb-5">
                Add Product
              </h2>

              {/* Input Fields */}
              <div className="text-gray-300 space-y-3">
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    id="productName"
                    name="productName"
                    label="Product Name"
                    variant="outlined"
                    fullWidth
                    sx={{
                      backgroundColor: "#292A36",
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-root": {
                        color: "white", // White text color
                        "& fieldset": { borderColor: "gray" },
                        "&:hover fieldset": { borderColor: "white" },
                        "&.Mui-focused fieldset": { borderColor: "#3B82F6" }, // Blue focus
                      },
                      "& .MuiInputLabel-root": {
                        color: "white", // White label
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#3B82F6", // Blue label when focused
                      },
                    }}
                    InputLabelProps={{
                      style: { color: "white" }, // White placeholder text
                    }}
                    onChange={(e) => setName(e.target.value)}
                  />

                  {/* Price */}
                  <TextField
                    id="price"
                    name="price"
                    label="Price"
                    type="number"
                    variant="outlined"
                    fullWidth
                    sx={{
                      backgroundColor: "#292A36",
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        "& fieldset": { borderColor: "gray" },
                        "&:hover fieldset": { borderColor: "white" },
                        "&.Mui-focused fieldset": { borderColor: "#3B82F6" },
                      },
                      "& .MuiInputLabel-root": {
                        color: "white",
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#3B82F6",
                      },
                    }}
                    InputLabelProps={{
                      style: { color: "white" },
                    }}
                    onChange={(e) => setPrice(e.target.value)}
                  />

                  {/* Description */}
                  <TextField
                    id="description"
                    name="description"
                    label="Description"
                    multiline
                    rows={4} // Adjust as needed
                    variant="outlined"
                    fullWidth
                    sx={{
                      backgroundColor: "#292A36",
                      borderRadius: "8px",
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        "& fieldset": { borderColor: "gray" },
                        "&:hover fieldset": { borderColor: "white" },
                        "&.Mui-focused fieldset": { borderColor: "#3B82F6" },
                      },
                      "& .MuiInputLabel-root": {
                        color: "white",
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#3B82F6",
                      },
                    }}
                    InputLabelProps={{
                      style: { color: "white" },
                    }}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Box>

                {/* Gender Selection */}
                <div className="flex h-10 justify-around text-white mt-0">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Men"
                      className="mr-2"
                      onChange={(e) => setGender(e.target.value)}
                    />
                    Men
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="gender"
                      value="Women"
                      className="mr-2"
                      onChange={(e) => setGender(e.target.value)}
                    />
                    Women
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  className={`bg-blue-950/30 border border-blue-950 w-full text-white px-4 py-2 mt-4 rounded-md 
                    ${loading ? "cursor-not-allowed opacity-75" : "hover:bg-blue-950 cursor-pointer"}`}
                  onClick={uploadImageAndSaveProduct}
                  disabled={loading}
                >
                  {loading && (
                    <svg
                      className="animate-spin h-5 w-5 mr-2 inline-block"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="white"
                        strokeWidth="3"
                        fill="none"
                      />
                    </svg>
                  )}
                  {loading ? "Uploading..." : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddProduct;
