---
title: "Secure Messenger - Preparation and Learning"
datePublished: Sat Aug 02 2025 09:37:43 GMT+0000 (Coordinated Universal Time)
cuid: cmdu278zh000c02ks7kcx8b3a
slug: secure-messenger-preparation-and-learning

---

This blog is not just a blog, it is like a compilation of diary entries from the start, where I was left stranded with a big goal in my head, all the way to the finish, where I had a complete framework and a whole app with a full fledged running backend and frontend for my secure messenger app. It will highlight all the challenges, learning and sparks of motivation that I got to continue doing what I was doing even though there was a massive path ahead. This article touches more upon the learning and preparations I did to get myself ready for making the full fledged app. I hope it also shows my compassion for future proof quantum security and computing and other aspects of app building and coding in general which helped me continue pushing towards my goal.

## Interest and Curiosity

There were various events in my everyday life that led me to believe quantum cryptography was the future. For example, [this video by Veritasium](https://www.youtube.com/watch?v=-UrdExQW0cs), a YouTuber I frequently enjoy watching, was initially what educated me about quantum computing. I soon found other videos (You can check out a few I found from my YouTube history here, I’m sure if you are reading this article you will find them interesting too! [1](https://www.youtube.com/watch?v=MeZ5e54VZQs) [2](https://www.youtube.com/watch?v=1zPGADtMJjU) [3](https://www.youtube.com/watch?v=ecvCfTPRBrI)) appearing on my YouTube feed which further interested me and fed my hunger of learning more on the topic. Moreover, there were several snippets of news that were frequently circulated which also fueled my fire, such as [This breakthrough by Google](https://www.nature.com/articles/s41586-019-1666-5), [Google developing a quantum chip](https://blog.google/technology/research/google-willow-quantum-chip/), various resources being available to public such as [AWS Braket](https://aws.amazon.com/braket/) and [Microsoft Azure Quantum](https://azure.microsoft.com/en-us/solutions/quantum-computing/), [IBM too developing a quantum chip](https://www.ibm.com/quantum/blog/127-qubit-quantum-processor-eagle), and even [NIST taking steps towards quantum cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography). Thus, to also step into the field, knowing I would probably want to take up such a subject in my higher studies, and to get my hands dirty, I decided to take up this project, not to necessarily build an application for its utility as the primary goal, although it could act as that too. I took this project to implement as much technical concepts as I could and to further brush up my skills in full stack development in the process as well.

## Starting out with encryption

So a new project, right. Since my main topic of learning for this project would be quantum security, I first thought of learning about the necessary concepts in a messenger app, which being encryption. I searched wide on the internet and found various resources to help me understand what it meant. I soon learned that there are two types of encryption - AES or symmetric, and RSA which is unsymmetric - and they are used hand in hand together for a secure passage of information. Again, YouTube is what guided me to gain detailed knowledge about these concepts. I started out with [a very basic video](https://www.youtube.com/watch?v=6-JjHa-qLPk) for understanding and introduction and rewatched [another video](https://www.youtube.com/watch?v=ecvCfTPRBrI) talking about the same concept, although highlighting the need for quantum encryption more.

Soon, I learned about NIST and found an [amazing documentation of AES](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197-upd1.pdf), which was although highly technical and had terms beyond my level of understanding, it was exactly what I was hungry to learn. I have always preferred reading documentation at my own pace since they were much more well defined and covered all cases and facts unlike YouTube videos or articles which only brushed through the topic to appeal to a wider audience. Although this documentation is still beyond the level of this project, it really helped me develop a core understand as I briefly went through the parts I liked. It is what I spent the majority of my free time with to get a better understand of the topic at hand and I think by now I can say that I do understand most of the concepts it uses.

I also learned about hybrid encryption and RSA through [this gem of a video](https://www.youtube.com/watch?v=wXB-V_Keiu8) which, although is very old, still explains the concept extremely well.

After all the research and videos I had gone through, it was finally time to try encryption on my own.

```python
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP, AES
from Crypto.Random import get_random_bytes
import base64

# Step 1: Generate RSA key pair
rsa_key = RSA.generate(2048)
private_key = rsa_key.export_key()
public_key = rsa_key.publickey().export_key()

# Step 2: Generate AES key
aes_key = get_random_bytes(16)

# Step 3: Encrypt a message using AES
message = b"Hello, this is a secret message!"
cipher_aes = AES.new(aes_key, AES.MODE_EAX)
ciphertext, tag = cipher_aes.encrypt_and_digest(message)

# Step 4: Encrypt AES key using RSA public key
cipher_rsa = PKCS1_OAEP.new(RSA.import_key(public_key))
enc_aes_key = cipher_rsa.encrypt(aes_key)

# ----------- On the Receiver Side -----------

# Step 5: Decrypt AES key using RSA private key
cipher_rsa_dec = PKCS1_OAEP.new(RSA.import_key(private_key))
dec_aes_key = cipher_rsa_dec.decrypt(enc_aes_key)

# Step 6: Decrypt message using AES key
cipher_aes_dec = AES.new(dec_aes_key, AES.MODE_EAX, nonce=cipher_aes.nonce)
decrypted_msg = cipher_aes_dec.decrypt_and_verify(ciphertext, tag)

# Show results
print("Original message:", message)
print("Decrypted message:", decrypted_msg)
```

I built this small demo app using both AES and RSA, also known as hybrid encryption. It was interesting to go through the documentation of the Crypto library to build this by reading through functions after many iterations, but I did at last build this after about 4-5 hours of scrambling to fix problems (and a lot of scrolling through stack overflow). I was heavily motivated after this, it was my first step in a whole marathon and I knew this subject clicked perfectly with me especially after this “app”. It will be common theme throughout this project that I found a new library which seems fit for the project, and instead of relying on AI tools and such, I decide to go through the documentation of the library to try and build the necessary program myself. It may be highly inefficient and this practice may change as I do receive more exposure, but it is what I love to do and I will continue so until I find a good reason not to even in this era led by AI tools and unoriginal work.

Also, I wish I could go through each and every question I was curious about in this blog (such as in the code above, I learnt about base64 encoding, what is EAX and nonce, OAEP, etc.) but if I did do so, this blog would end up being a whole book, which although would be cool, wouldn’t be very practical for a school student like me who is tight on time enough with all my studies.

## Learning backend development with flask

Next, since I was making a full fledged app (which I have never done before, I’m only proficient in React and frontend), I started out with learning backend and flask seemed to be the library that kept popping up in my research. So, naturally I went on to setup flask and was shocked by how [well written and documented](https://flask.palletsprojects.com/en/stable/) flask was. They really had everything needed to start or to advance right in your face available at any time, which I do appreciate and love when anything new I try to learn has that.

Anyways, after experimenting and reading through the docs I ended up with the following code.

```python
from flask import Flask, request, jsonify
import os
import json

app = Flask(__name__)

# Load or initialize message store
if os.path.exists("messages.json"):
    with open("messages.json", "r") as f:
        messages = json.load(f)
else:
    messages = {}

@app.route("/send", methods=["POST"])
def send_message():
    data = request.json
    sender = data["sender"]
    receiver = data["receiver"]
    encrypted_message = data["message"]
    enc_key = data["enc_key"]
    nonce = data["nonce"]
    tag = data["tag"]

    if receiver not in messages:
        messages[receiver] = []

    messages[receiver].append({
        "from": sender,
        "message": encrypted_message,
        "enc_key": enc_key,
        "nonce": nonce,
        "tag": tag
    })

    with open("messages.json", "w") as f:
        json.dump(messages, f)

    return jsonify({"status": "Message sent!"})

@app.route("/messages", methods=["GET"])
def get_messages():
    user = request.args.get("user")
    return jsonify(messages.get(user, []))

if __name__ == "__main__":
    app.run(debug=True)
```

I was so excited to see my encrypted messages in the `messages.json` file I had made, and the decrypted messages appear at `localhost:5000`. Honestly, it’s these little goals and steps forward that kept refueling my motivation to complete my project as a whole. I was initially overwhelmed when I started out learning flask, but the documentation and my father really made it a piece of cake after spending some time learning. By now, I had been working on this project for about 3 days to a week, and I was already extremely hopeful for its future and what was to come, since I pretty much new every concept from here on out. To think I was extremely lost just a week back and now I had access to all the resources and knowledge needed to advance.

Next, I made individual scripts to read message and write messages so that they all appear in the console instead of going specifically in the file, or going to a specific URL to check encrypted and decrypted messages. After hours of experimenting, I managed to get the following output.

```python
1 encrypted message(s) received for bob:

From alice: Hey Bob! This is a secret message.
```

I remembering staying up super late at night to struggle through all the debugging and finally getting this last result, only then sleeping. Any concept in computer science is truly like an addiction for me.

## Brushing up React frontend and learning axios

Now that I learnt flask and making routes, it was time to think about frontend. I had already been proficient in React due to the [course in Udemy](https://www.udemy.com/course/react-the-complete-guide-incl-redux/) I had learnt from, where I had also made a few small apps. However, I had never worked with a backend API and axios seemed the best fit for the task. I used ChatGPT to guide me through axios and using it to handle API requests, which wasn’t much of a daunting task for me. After about an hour I felt confident and ready for what was ahead of me.

## A clear path ahead

After about a week of work and learning, I felt prepared for my upcoming goal of making a secure messenger. I had learnt backend development in brief, brushed my skills in frontend and learnt the core concept that would guide this project, being encryption. I was finally packed up with all the knowledge and tools at my disposal which were required and thus, my journey only started here.