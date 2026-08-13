fn main() {
    println!("cargo:rerun-if-changed=src/cxx/order_book_avx.cpp");
    println!("cargo:rerun-if-changed=src/cxx/order_book_avx.h");

    let mut build = cc::Build::new();
    build.cpp(true).file("src/cxx/order_book_avx.cpp");

    if cfg!(target_env = "msvc") {
        build.flag("/std:c++20").flag("/arch:AVX512").flag("/O2");
    } else {
        build.std("c++20").flag("-mavx512f").flag("-mavx512dq").flag("-O3");
    }

    build.compile("order_book_avx");
}