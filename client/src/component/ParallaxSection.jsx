import React from "react";
import { motion } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import images from "../../public/images";

const promotionalData = [
  {
    id: 1,
    title: "Welcome to DGX Community",
    description:
      "India's fastest growing tech community where innovation meets collaboration.",
    icon: "🚀",
    screenshots: [images.screenshot1, images.screenshot3, images.screenshot4],
  },
  {
    id: 2,
    title: "Faculty Development Programs",
    description:
      "Empowering educators with cutting-edge training and certifications.",
    icon: "🎓",
    qr: "https://ngevent.servergi.com:8071/FDPevent/home/?urlData=",
  },
  {
    id: 3,
    title: "Build. Learn. Connect.",
    description:
      "Exclusive workshops, hackathons, and networking opportunities await you.",
    icon: "💡",
    screenshots: [images.screenshot2, images.screenshot5, images.screenshot],
  },
];

const ParallaxSection = () => {
  return (
    <section className="relative w-full min-h-screen flex flex-col justify-center items-center overflow-hidden bg-blue-50 px-6 py-16">
      {/* Soft floating background shapes */}
      <motion.div
        className="absolute top-0 left-0 w-72 h-72 bg-green-200 rounded-full opacity-30 mix-blend-multiply filter blur-3xl"
        animate={{ y: [0, 50, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-64 h-64 bg-blue-200 rounded-full opacity-25 mix-blend-multiply filter blur-3xl"
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Hero Wrapper */}
      <div className="relative z-10 max-w-7xl w-full flex flex-col items-center">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-extrabold text-center mb-4 text-DGXblue p-3"
        >
          🚀 DGX Community
        </motion.h1>

        {/* Sub-heading */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-lg md:text-2xl text-DGXgreen text-center mb-12 font-medium p-8"
        >
          Learn, Build & Connect with India’s fastest growing tech ecosystem
        </motion.p>

        <div className="grid md:grid-cols-3 gap-16 w-full">
          {promotionalData.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="bg-green-50 rounded-3xl shadow-lg p-8 flex flex-col items-center text-center relative border border-green-200 hover:shadow-green-300/50 overflow-hidden h-[600px]"
            >
              <div className="text-6xl mb-5">{item.icon}</div>
              <h2 className="text-3xl md:text-4xl font-bold text-DGXblue mb-4">{item.title}</h2>
              <p className="text-DGXblue text-lg md:text-xl mb-6 leading-relaxed">{item.description}</p>

              {item.screenshots && (
                <div className="h-[280px] w-[240px] overflow-hidden relative mb-6 rounded-xl">
                  <motion.div
                    animate={{ y: ["0%", "-100%"] }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="flex flex-col gap-5"
                  >
                    {item.screenshots.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`${item.title} screenshot ${i + 1}`}
                        className="w-[240px] rounded-xl shadow-md border border-green-200"
                      />
                    ))}
                    <img
                      src={item.screenshots[0]}
                      alt={`${item.title} screenshot repeat`}
                      className="w-[240px] rounded-xl shadow-md border border-green-200"
                    />
                  </motion.div>
                </div>
              )}

              {item.qr && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="bg-green-50 p-6 rounded-xl shadow-md border-2 border-green-300"
                >
                  <QRCodeCanvas value={item.qr} size={140} />
                </motion.div>
              )}

            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ParallaxSection;
