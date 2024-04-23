from diffusers import AutoPipelineForText2Image
import torch
import socketio
import base64
from io import BytesIO
import time

pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16")
pipe.to("cuda")

sockAddr = "http://localhost:3000"

prompt = " "

startTime = 0

with socketio.SimpleClient() as sio:
    sio.connect(sockAddr)
    sio.emit("identifyGenerator")
    
    keepConnected = True
    while(keepConnected):
        event = sio.receive()
        print(str(event)[0:50])
        match event[0]:
            case "prompt":
                startTime = time.time()*1000
                prompt = event[1]
                buff = BytesIO()
                image = pipe(prompt=prompt, num_inference_steps=1, guidance_scale=0.0).images[0]
                generationTime = (time.time() * 1000) - startTime
                image.save(buff, format="JPEG")
                formattedImage = base64.b64encode(buff.getvalue())
                formattingTime = (time.time() * 1000) - startTime - generationTime
                sio.emit("generatedImage", \
                         {"prompt": prompt, "genTime" : generationTime, \
                          "formatTime" : formattingTime, "img" : formattedImage})
            case "imageRecieved":
                print("took " + str((time.time() * 1000) - startTime) + " ms")
            case "exitGenerator":
                keepConnected = False
            case "disconnect":
                print("Disconnect")
                if(event[1] == "io server disconnect"):
                    keepConnected = False