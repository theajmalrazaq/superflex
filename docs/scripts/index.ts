import { reviewsSchema, type Review } from "../../src/schemas/reviews";
import reviewData from "../../public/reviews.json";
import { initSiteNavigation } from "./navigation";

initSiteNavigation();

const generateReviewCards = (items: Review[]): DocumentFragment => {
  const fragment = document.createDocumentFragment();
  for (const item of items) {
    const card = document.createElement("div");
    card.className = "review-card";
    card.innerHTML =
      '<div class="review-header"><div class="review-user-info"><span class="review-name"></span><span class="review-verified">Student Verified</span></div></div><p class="review-comment"></p>';
    card.querySelector(".review-name")!.textContent = item.name;
    card.querySelector(".review-comment")!.textContent = `"${item.comment}"`;
    fragment.appendChild(card);
  }
  return fragment;
};

const reviewTrack = document.getElementById("review-track");
const parsedReviews = reviewsSchema.safeParse(reviewData);
if (reviewTrack) {
  if (parsedReviews.success && parsedReviews.data.length) {
    const subset = parsedReviews.data.slice(0, 20);
    reviewTrack.replaceChildren(generateReviewCards(subset), generateReviewCards(subset));
  } else {
    reviewTrack.textContent = "Reviews are temporarily unavailable.";
  }
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (this: HTMLAnchorElement, e) {
    const href = this.getAttribute("href");

    if (href && href.startsWith("#") && href.length > 1) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
  });
});
