import { memo } from "react";
import "./style.scss";
import cr7 from '../../../assets/images/cr7.png'
import adobe from '../../../assets/images/adobe.png'
import logofc from '../../../assets/images/logofc.png'
import League_of_Legends_2019_vector from '../../../assets/images/League_of_Legends_2019_vector.png'
import steam_logo from '../../../assets/images/steam_logo.png'
const Homepage = () => {
    return (
        <div id="content">
            <div className="banner">
            
                        <div id="section-1">
                            <div class="introduce">
                              <h1 class="text-introduce">
                                 YOUR SATISFACTION OUR Priority
                              </h1>
                             <p class="text-title"> we are comited to delivering top</p>
                             <a href="" class="btn-shop">SHOP NOW</a>
                             <div class="quality">
                                 <div class="quality-item">
                                     <h2 class="quality-count">200+</h2>
                                     <p class="quality-text">International Brands</p>
                                 </div>
                                 <div class="quality-item">
                                     <h2 class="quality-count">2,000+</h2>
                                     <p class="quality-text">High-Quality Products</p>
                                 </div>
                                 <div class="quality-item">
                                     <h2 class="quality-count">30,000+</h2>
                                     <p class="quality-text">Happy Customers</p>
                                 </div>
                                 
                                 
                             </div>
                            </div>
                            
                                 <img src={cr7} alt="" class="cr7"/>
                           
                         </div>
                        
                

            </div>
                     <div class="logo">
                        <img src={logofc} alt="" class="section-logo"/>
                        <img src={League_of_Legends_2019_vector} alt="" class="section-logo"/>
                        <img src={steam_logo} alt="" class="section-logo"/>
                        <img src={adobe} alt="" class="section-logo"/>
                        </div>
            <div className="Products">  
                <div className="grid">
                    <div className="grid__row">
                        <div className="grid__column-12">
                            <div className="home-product">
                                <div className="grid__row">
                                    <div className="grid__column-3">
                                        <div className="home-product-item">
                                            <div className="home-product-item_img" style={{
                                              
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default memo(Homepage);
