import os
import tensorflow as tf
import kagglehub
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

# Define paths
model_path = 'models/disease_model.h5'

print("Locating the full PlantVillage dataset local folders...")
dataset_path = 'dataset/plantvillage dataset/color'

print(f"Dataset successfully loaded from: {dataset_path}")

# Hyperparameters
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 3 # Kept low for laptop CPU since we now have 38 classes & 54,000 images

print("Setting up ImageDataGenerators...")
# We use a validation split to train and validate on the same folder
datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    validation_split=0.2 # 20% validation
)

print("Loading Training Data...")
train_generator = datagen.flow_from_directory(
    dataset_path,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='training'
)

print("Loading Validation Data...")
val_generator = datagen.flow_from_directory(
    dataset_path,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode='categorical',
    subset='validation'
)

num_classes = len(train_generator.class_indices)
print(f"Detected {num_classes} disease classes.")

# Save the class names so the backend app can label predictions
import json
with open('models/disease_classes.json', 'w') as f:
    json.dump(list(train_generator.class_indices.keys()), f)

print("Building CNN Model using MobileNetV2 Transfer Learning...")
# Base model: MobileNetV2 pre-trained on ImageNet
base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))

# Freeze the base model layers
base_model.trainable = False

# Add custom classification head
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(128, activation='relu')(x)
x = Dropout(0.2)(x)
predictions = Dense(num_classes, activation='softmax')(x)

model = Model(inputs=base_model.input, outputs=predictions)

model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Callbacks
callbacks = [
    EarlyStopping(monitor='val_loss', patience=3, restore_best_weights=True),
    ModelCheckpoint(model_path, monitor='val_accuracy', save_best_only=True)
]

print("Starting training process... (This may take a while depending on hardware)")
history = model.fit(
    train_generator,
    steps_per_epoch=10,
    validation_data=val_generator,
    validation_steps=2,
    epochs=1,
    callbacks=callbacks
)

print(f"Training Complete! Model saved successfully to {model_path}")
