import sys
from diffusers import AutoPipelineForText2Image
import torch
import socketio
import base64
from io import BytesIO
import time
import threading

pipe = AutoPipelineForText2Image.from_pretrained("stabilityai/sdxl-turbo", torch_dtype=torch.float16, variant="fp16")
pipe.to("cuda")

sockAddr = "http://localhost:3000"

prompt = " "
timedOutAlready = False
startTime = 0

async def verifyConnection(socket):
    print("starting async")
    future = asyncio.create_task(pollServer(socket))
    print("Task created")
    await asyncio.sleep(3)
    print("done sleeping")
    if(future.done()):
        print("task was done")
        return
    else:
        print("Task wasn't done")
        exit()

async def pollServer(socket):
    await asyncio.sleep(0.1)
    socket.call("stillThere")

with socketio.SimpleClient() as sio:
    sio.connect(sockAddr)
    sio.emit("identifyGenerator")
    
    keepConnected = True
    while(keepConnected):
        try:
            event = sio.receive(timeout=30) # must timeout twice to close generator
        except socketio.exceptions.TimeoutError:
            if(timedOutAlready):
                print("Can't reach server")
                keepConnected = False
            else:
                print("Verifying server connection")
                timedOutAlready = True
                t1 = threading.Thread(target=sio.emit, args=("stillThere",))
                t1.daemon = True # Causes thread to exit when main thread exits
                t1.start()
        else:
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
                case "yupStillHere":
                    print("Server still connected")
                    timedOutAlready = False