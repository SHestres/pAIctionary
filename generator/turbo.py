from diffusers import AutoPipelineForText2Image
import torch
import socketio

pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16")
pipe.to("cuda")

sockAddr = "http://localhost:3000"

prompt = " "

with socketio.SimpleClient() as sio:
    sio.connect(sockAddr)
    sio.emit("identifyGenerator")
    
    keepConnected = True
    while(keepConnected):
        event = sio.receive()
        print(event)
        match event[0]:
            case "prompt":
                prompt = event[1]
                image = pipe(prompt=prompt, num_inference_steps=1, guidance_scale=0.0).images[0]
                image.show()
            case "disconnect":
                if(event[1] == "io server disconnect"):
                    keepConnected = False