const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema(
  {
    phoneName: { type: String, required: true },
    brand: { type: String, required: true, index: true },
    sourceUrl: { type: String },

    priceText: { type: String },
    priceApprox: { type: Number, index: true },

    releaseText: { type: String },
    releaseYear: { type: Number, index: true },

    networkTechnology: { type: String },
    supports5G: { type: Boolean, default: false, index: true },

    bodyDimensions: { type: String },
    weight: { type: String },
    sim: { type: String },
    hasDualSim: { type: Boolean, default: false, index: true },

    displayType: { type: String },
    displaySize: { type: String },
    displayResolution: { type: String },
    refreshRate: { type: Number },

    os: { type: String },
    chipset: { type: String },
    cpu: { type: String },
    gpu: { type: String },
    chipsetTier: { type: String, index: true },

    memoryInternal: { type: String },
    ramOptions: [Number],
    storageOptions: [Number],

    mainCamera: { type: String },
    mainCameraFeatures: { type: String },
    mainCameraVideo: { type: String },
    cameraTier: { type: String },

    selfieCamera: { type: String },
    selfieCameraVideo: { type: String },

    batteryType: { type: String },
    batteryMah: { type: Number },
    charging: { type: String },
    batteryTier: { type: String },

    nfc: { type: String },
    supportsNFC: { type: Boolean, default: false, index: true },
    usb: { type: String },
    headphoneJack: { type: String },
    hasHeadphoneJack: { type: Boolean, default: false },

    categoryTags: { type: [String], index: true },

    imageUrl: { type: String, default: null },
    brandPlaceholder: { type: String },

    wishlistCount: { type: Number, default: 0 },
    compareCount: { type: Number, default: 0 },

    rawSpecs: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

phoneSchema.index({ phoneName: 'text', brand: 'text' });

module.exports = mongoose.model('Phone', phoneSchema);
