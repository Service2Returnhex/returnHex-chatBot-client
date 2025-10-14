"use client"
import { useState } from "react"
import { FormField } from "./ui/FormField"

export default function LeadForm() {
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const [formData, setFormData] = useState({
        pageName: "",
        phone: "",
        businessType: "",
        message: "",
        pageLink: ""
    })
    return (
        <div className="min-h-screen w-full relative bg-radial-aurora text-white bg-fixed ">
            <div className="container flex flex-col justify-center items-center  mx-auto px-4 py-8 relative z-10 ">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-600 bg-clip-text text-transparent flex items-center px-2 py-4 leading-tight">
                    আপনার পেইজে AutoPing AI চালু করতে নিচের ফর্মটি পূরণ করুন
                </h1>

                <h3 className="mt-1 text-sm sm:text-base text-gray-300 py-2 pb-4 max-w-[80ch]">
                    আপনার ব্যবসার ধরণ ও যোগাযোগের তথ্য দিন — আমরা খুব শিগগিরই আপনার সঙ্গে কথা বলব।
                </h3>
                <div className="w-full md:w-6/12  space-y-3 bg-gradient-to-b from-white/5 to-white/2   border border-white/50 filter bg-blur-xl p-4  backdrop-blur-xl transition-transform  rounded-2xl">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent">
                        Lead form
                    </h2>
                    <FormField
                        label="Page Name"
                        id="pageName"
                        value={formData.pageName}
                        onChange={(val) => setFormData((f) => ({ ...f, pageName: val }))}
                        placeholder="Enter your Facebook page name"
                        required
                    />
                    <FormField
                        label="Phone"
                        id="phone"
                        value={formData.phone}
                        onChange={(val) => setFormData((f) => ({ ...f, phone: val }))}
                        placeholder="Enter your Phone Number"
                        required
                    />
                    <FormField
                        label="BusinessType"
                        id="businessType"
                        value={formData.businessType}
                        onChange={(val) => setFormData((f) => ({ ...f, businessType: val }))}
                        placeholder="Enter your Business Type"
                        required
                    >
                        <select name="businessType" id="businessType"
                            value={formData.businessType}
                            onChange={(e) => setFormData((f) => ({ ...f, businessType: e.target.value }))}
                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-900 text-white focus:ring focus:ring-blue-500"
                        >
                            <option value="">Select your business</option>
                            <option value="ecommerce">E-commerce Store</option>
                            <option value="restaurant">Restaurant</option>
                            <option value="restaurant">Service</option>
                            <option value="fashion">Fashion Brand</option>
                            <option value="electronics">Electronics Shop</option>
                            <option value="education">Education Service</option>
                            <option value="agency">Marketing Agency</option>
                            <option value="health">Health & Fitness</option>
                            <option value="health">Other</option>
                        </select>

                    </FormField>
                    <FormField
                        label="Page Link"
                        id="pageLink"
                        value={formData.pageLink}
                        onChange={(val) => setFormData((f) => ({ ...f, pageLink: val }))}
                        placeholder="Enter your Facebook Page Link"
                    />
                    <FormField
                        label="Message"
                        id="message"
                        value={formData.message}
                        type="textarea"
                        onChange={(val) => setFormData((f) => ({ ...f, moreInfo: val }))}
                        placeholder="e.g., Add a few words about your business"
                    />

                    <button
                        // onClick={handleProvideInfo}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-blue-600 cursor-pointer"
                    >
                        {isLoading ? "submitting..." : "Submit Info"}
                    </button>

                    {/* {webhookURL && (
                            <div className="bg-green-100 p-2 rounded text-black">
                                <p>
                                    <strong>Webhook URL:</strong> {webhookURL}
                                </p>
                                <p>
                                    <strong>Verify Token:</strong> {formData.verifyToken}
                                </p>
                            </div>
                        )} */}

                    {/* {verifyWebHook && (
                            <>
                                <p>
                                    Note: If Webhook is configured then collect and submit the
                                    access token and start the app
                                </p>
                                <div>
                                    <FormField
                                        label="Access Token"
                                        id="accessToken"
                                        value={formData.accessToken}
                                        onChange={(val) =>
                                            setFormData((f) => ({ ...f, accessToken: val }))
                                        }
                                        placeholder="Your page access token"
                                        required
                                    />

                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={handleSendAccessToken}
                                            className="bg-purple-600 text-white px-4 py-2 rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl hover:shadow-purple-600  cursor-pointer"
                                        >
                                            Submit Access Token
                                        </button>

                                        <button
                                            onClick={() => {
                                                if (!isStarted) handleStartApp()
                                                else handleStopApp()
                                            }}
                                            className={`${isStarted ? "bg-red-600 hover:shadow-red-600" : "bg-green-600 hover:shadow-green-600"} text-white px-4 py-2 rounded hover:scale-105
    transition-transform duration-300 hover:shadow-2xl   cursor-pointer`}
                                        >
                                            {isStarted ? "Stop App" : "Start App"}

                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div> */}
                </div>
            </div>
        </div>
    )
}
