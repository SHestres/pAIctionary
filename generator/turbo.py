from diffusers import AutoPipelineForText2Image
import torch

pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16")
pipe.to("cuda")

prompt = "A cinematic shot of a baby racoon wearing an intricate italian priest robe."

allImages = []

for i in range(15):
    allImages.append(pipe(prompt=prompt, num_inference_steps=1, guidance_scale=0.0).images[0])

for i in range(15):
    allImages[i].show()