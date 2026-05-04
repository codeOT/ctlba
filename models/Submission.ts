import mongoose, { Schema, type InferSchemaType } from "mongoose";

const submissionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    supplierData: { type: Schema.Types.Mixed, required: true },
    guarantorData: { type: Schema.Types.Mixed, required: true },
    supplierSignature: { type: String, default: "" },
    guarantorSignature: { type: String, default: "" },
    supplierDocumentNames: { type: Schema.Types.Mixed, default: {} },
    guarantorDocumentNames: { type: Schema.Types.Mixed, default: {} },
    supplierFileIds: { type: Schema.Types.Mixed, default: {} },
    guarantorFileIds: { type: Schema.Types.Mixed, default: {} },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export type SubmissionDocument = InferSchemaType<typeof submissionSchema> & {
  _id: mongoose.Types.ObjectId;
};

const Submission =
  (mongoose.models.Submission as mongoose.Model<SubmissionDocument>) ||
  mongoose.model<SubmissionDocument>("Submission", submissionSchema);

export default Submission;
